import { getAdminSession, type AdminSession } from "./session";
import { isSessionRejected, wordpressAuthedFetch } from "./wordpress-auth";
import { isRejectedActualite } from "./markers";
import { decodeHtmlEntities, decodeTextFields } from "@/lib/decodeHtml";
import { RPAE_CATEGORY_SLUG, RPAE_INTERNAL_CATEGORY_SLUG } from "@/lib/rpae";

/**
 * Couche de lecture côté serveur pour l'espace contributeurs — utilisée
 * directement par les pages (Composants Serveur), sans repasser par les
 * routes /api/admin/* (celles-ci ne servent qu'aux actions déclenchées côté
 * client : créer, modifier, publier, rejeter).
 *
 * Chaque lecture renvoie un résultat explicite : une erreur WordPress n'est
 * plus transformée en liste vide, et un jeton expiré est signalé (la page
 * renvoie alors à la connexion).
 */

export type AdminResult<T> =
  | { ok: true; data: T }
  | { ok: false; expired: boolean; error: string };

const MAX_PAGES = 50; // 50 × 100 éléments : largement au-delà des besoins actuels

/** Texte simple (titres, extraits) : balises retirées puis entités décodées. */
function stripHtml(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

function failure(status: number, body: unknown): { ok: false; expired: boolean; error: string } {
  const data = (body && typeof body === "object" ? body : {}) as { code?: unknown; message?: unknown };
  const code = typeof data.code === "string" ? data.code : undefined;
  if (isSessionRejected(status, code)) return { ok: false, expired: true, error: "Session expirée." };
  const message =
    typeof data.message === "string" ? stripHtml(data.message) : `Erreur WordPress (HTTP ${status}).`;
  return { ok: false, expired: false, error: `WordPress n'a pas pu fournir ces données : ${message}` };
}

async function fetchJson<T>(session: AdminSession, path: string): Promise<AdminResult<{ body: T; totalPages: number }>> {
  let res: Response;
  try {
    res = await wordpressAuthedFetch(path, session.token);
  } catch {
    return { ok: false, expired: false, error: "Impossible de contacter le serveur WordPress." };
  }
  const raw = await res.text();
  let body: unknown = null;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    return { ok: false, expired: false, error: "Réponse WordPress invalide (non-JSON) — pare-feu de l'hébergement ?" };
  }
  if (!res.ok) return failure(res.status, body);
  const totalPages = Number(res.headers.get("X-WP-TotalPages") ?? "1") || 1;
  return { ok: true, data: { body: body as T, totalPages } };
}

/** Toutes les pages d'une liste paginée WordPress (per_page=100), au-delà des 100 premiers éléments. */
async function fetchAllPages<T>(session: AdminSession, path: string): Promise<AdminResult<T[]>> {
  const separator = path.includes("?") ? "&" : "?";
  const items: T[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await fetchJson<T[]>(session, `${path}${separator}per_page=100&page=${page}`);
    if (!result.ok) return result;
    items.push(...(Array.isArray(result.data.body) ? result.data.body : []));
    if (page >= result.data.totalPages) break;
  }
  return { ok: true, data: items };
}

async function withSession<T>(run: (session: AdminSession) => Promise<AdminResult<T>>): Promise<AdminResult<T>> {
  const session = await getAdminSession();
  if (!session) return { ok: false, expired: true, error: "Session expirée." };
  return run(session);
}

// --- Catégories ----------------------------------------------------------------

export type AdminCategory = { id: number; name: string; slug: string };

/** Catégories techniques, jamais proposées dans la liste : versions anglaises et revue scientifique. */
export const HIDDEN_CATEGORY_SLUGS = new Set(["en", "english", RPAE_CATEGORY_SLUG, RPAE_INTERNAL_CATEGORY_SLUG]);

async function fetchCategories(session: AdminSession): Promise<AdminResult<AdminCategory[]>> {
  const result = await fetchAllPages<{ id: number; name: string; slug: string }>(session, "/categories?hide_empty=false");
  if (!result.ok) return result;
  return {
    ok: true,
    data: result.data.map((c) => ({ id: c.id, name: decodeHtmlEntities(c.name), slug: c.slug })),
  };
}

export function listCategories(): Promise<AdminResult<AdminCategory[]>> {
  return withSession(fetchCategories);
}

// --- Actualités (natif /wp/v2/posts) ---------------------------------------

export type AdminActualiteListItem = {
  id: string;
  title: string;
  excerpt: string;
  status: string;
  rejected: boolean;
  date: string;
  authorId: number;
  authorName: string | null;
  categoryName: string | null;
};

export type AdminActualiteDetail = {
  id: string;
  title: string;
  excerpt: string;
  /** Contenu brut tel qu'enregistré (context=edit), jamais le HTML rendu décodé. */
  content: string;
  status: string;
  rejected: boolean;
  authorId: number;
  categoryIds: number[];
  coverImage: string | null;
  featuredMediaId: number | null;
};

type WpPostRaw = {
  id: number;
  status: string;
  date: string;
  author: number;
  categories?: number[];
  title: { rendered: string; raw?: string };
  excerpt: { rendered: string; raw?: string };
  content: { rendered: string; raw?: string };
  featured_media: number;
  _embedded?: {
    author?: { name: string }[];
    "wp:featuredmedia"?: { source_url: string }[];
    "wp:term"?: { name: string; slug: string; taxonomy?: string }[][];
  };
};

/** Identifiants des catégories de la revue scientifique (exclues des actualités). */
export function rpaeCategoryIds(categories: AdminCategory[]): number[] {
  return categories
    .filter((c) => c.slug === RPAE_CATEGORY_SLUG || c.slug === RPAE_INTERNAL_CATEGORY_SLUG)
    .map((c) => c.id);
}

export function postIsRpae(post: Pick<WpPostRaw, "categories" | "title" | "content">, rpaeIds: number[]): boolean {
  if ((post.categories ?? []).some((id) => rpaeIds.includes(id))) return true;
  if (/^\s*\[RPAE\]/i.test(stripHtml(post.title.raw ?? post.title.rendered))) return true;
  return /<!--\s*rpae:/i.test(post.content.raw ?? post.content.rendered);
}

export function listActualites(): Promise<AdminResult<AdminActualiteListItem[]>> {
  return withSession(async (session) => {
    const categories = await fetchCategories(session);
    if (!categories.ok) return categories;
    const rpaeIds = rpaeCategoryIds(categories.data);
    const exclude = rpaeIds.length > 0 ? `&categories_exclude=${rpaeIds.join(",")}` : "";
    const statusParams = ["publish", "pending", "draft"].map((s) => `status[]=${s}`).join("&");
    const posts = await fetchAllPages<WpPostRaw>(session, `/posts?_embed&${statusParams}${exclude}`);
    if (!posts.ok) return posts;

    const nameById = new Map(categories.data.map((c) => [c.id, c.name]));
    const items = posts.data
      .filter((post) => !postIsRpae(post, rpaeIds))
      .map((post) => {
        const visible = (post.categories ?? []).filter((id) => {
          const slug = categories.data.find((c) => c.id === id)?.slug;
          return slug && !HIDDEN_CATEGORY_SLUGS.has(slug);
        });
        return {
          id: String(post.id),
          title: stripHtml(post.title.rendered),
          excerpt: stripHtml(post.excerpt.rendered),
          status: post.status,
          rejected: post.status === "draft" && isRejectedActualite(post.content.rendered),
          date: post.date,
          authorId: post.author,
          authorName: post._embedded?.author?.[0]?.name ?? null,
          categoryName: visible.map((id) => nameById.get(id)).filter(Boolean).join(", ") || null,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { ok: true, data: items };
  });
}

export function getActualite(id: string): Promise<AdminResult<AdminActualiteDetail | null>> {
  return withSession(async (session) => {
    const result = await fetchJson<WpPostRaw>(session, `/posts/${encodeURIComponent(id)}?context=edit&_embed`);
    if (!result.ok) {
      return result.error.includes("HTTP 404") || /introuvable|invalid post id/i.test(result.error)
        ? { ok: true, data: null }
        : result;
    }
    const post = result.data.body;
    const content = post.content.raw ?? post.content.rendered;
    return {
      ok: true,
      data: {
        id: String(post.id),
        title: post.title.raw ?? stripHtml(post.title.rendered),
        excerpt: post.excerpt.raw ?? stripHtml(post.excerpt.rendered),
        content,
        status: post.status,
        rejected: post.status === "draft" && isRejectedActualite(content),
        authorId: post.author,
        categoryIds: post.categories ?? [],
        coverImage: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null,
        featuredMediaId: post.featured_media || null,
      },
    };
  });
}

// --- Publications / Partenaires (mu-plugin) ---------------------------------

export type AdminPublication = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type?: string;
  year?: number;
  fileUrl?: string;
  fileSizeKb?: number;
  status: string;
  rejected?: boolean;
  authorId: number;
  authorName?: string;
};

export type AdminPartenaire = {
  id: string;
  slug: string;
  name: string;
  websiteUrl?: string;
  logoUrl?: string;
  status: string;
  rejected?: boolean;
  authorId: number;
  authorName?: string;
};

/** Champs texte décodés (« d&#8217;analyse » → « d’analyse ») : affichés comme du texte, jamais comme du HTML. */
async function listContent<T extends object>(path: string, textKeys: readonly (keyof T)[]): Promise<AdminResult<T[]>> {
  return withSession(async (session) => {
    const result = await fetchJson<T[]>(session, path);
    if (!result.ok) return result;
    const items = Array.isArray(result.data.body) ? result.data.body : [];
    return { ok: true, data: items.map((item) => decodeTextFields(item, textKeys)) };
  });
}

async function getContentOne<T extends object>(path: string, textKeys: readonly (keyof T)[]): Promise<AdminResult<T | null>> {
  return withSession(async (session) => {
    const result = await fetchJson<T>(session, path);
    if (!result.ok) return result.error.includes("Introuvable") ? { ok: true, data: null } : result;
    return { ok: true, data: decodeTextFields(result.data.body, textKeys) };
  });
}

const PUBLICATION_TEXT = ["title", "description", "authorName"] as const;
const PARTENAIRE_TEXT = ["name", "authorName"] as const;
const JOURNAL_TEXT = ["actorName", "entityTitle"] as const;

export function listPublications(): Promise<AdminResult<AdminPublication[]>> {
  return listContent<AdminPublication>("/publications", PUBLICATION_TEXT);
}
export function getPublication(id: string): Promise<AdminResult<AdminPublication | null>> {
  return getContentOne<AdminPublication>(`/publications/${encodeURIComponent(id)}`, PUBLICATION_TEXT);
}

export function listPartenaires(): Promise<AdminResult<AdminPartenaire[]>> {
  return listContent<AdminPartenaire>("/partenaires", PARTENAIRE_TEXT);
}
export function getPartenaire(id: string): Promise<AdminResult<AdminPartenaire | null>> {
  return getContentOne<AdminPartenaire>(`/partenaires/${encodeURIComponent(id)}`, PARTENAIRE_TEXT);
}

// --- Journal des validations -------------------------------------------------

export type AdminJournalEntry = {
  id: string;
  date: string;
  actorId: number;
  actorName: string;
  action: string;
  entityType: string;
  entityId: number;
  entityTitle: string;
};

export function listJournal(): Promise<AdminResult<AdminJournalEntry[]>> {
  return listContent<AdminJournalEntry>("/journal", JOURNAL_TEXT);
}

// Réutilisés par la lecture RPAE (lib/admin/rpae.ts).
export { fetchAllPages, fetchCategories, withSession };
export type { WpPostRaw };
