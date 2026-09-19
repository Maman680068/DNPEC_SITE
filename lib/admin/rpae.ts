import { getAdminSession } from "./session";
import { wordpressAuthedFetch } from "./wordpress-auth";
import { decodeHtmlEntities } from "@/lib/decodeHtml";
import {
  parseRpaeMetadata,
  resolveArticleYear,
  authorDisplayName,
  profilLabel,
  RPAE_CATEGORY_SLUG,
  RPAE_INTERNAL_CATEGORY_SLUG,
  type RpaeSubmissionMeta,
} from "@/lib/rpae";

/**
 * Couche de lecture RPAE pour l'espace contributeurs — contrairement au
 * catalogue public (lib/wordpress.ts, catégorie `rpae` publiée uniquement),
 * ici on lit TOUS les statuts et les deux catégories (`rpae` et
 * `rpae-interne`) : le comité doit pouvoir relire/valider/rejeter tout ce
 * qui a été soumis, y compris les travaux internes/sur commande.
 */

function stripHtml(html: string): string {
  return decodeHtmlEntities(html)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

type WpPostRaw = {
  id: number;
  status: string;
  date: string;
  title: { rendered: string };
  content: { rendered: string; raw?: string };
};

export type AdminRpaeListItem = {
  id: string;
  title: string;
  auteur: string;
  profilLabel: string;
  theme: string;
  editionAnnee?: string;
  year: number;
  date: string;
  status: string;
  usage: string;
};

export type AdminRpaeDetail = AdminRpaeListItem & {
  meta: RpaeSubmissionMeta;
};

async function findCategoryId(token: string, slug: string): Promise<number | null> {
  try {
    const res = await wordpressAuthedFetch(`/categories?slug=${encodeURIComponent(slug)}`, token);
    if (!res.ok) return null;
    const list = (await res.json()) as { id: number }[];
    return list[0]?.id ?? null;
  } catch {
    return null;
  }
}

async function fetchPostsByCategory(token: string, categoryId: number): Promise<WpPostRaw[]> {
  try {
    const statusParams = ["publish", "pending", "draft"].map((s) => `status[]=${s}`).join("&");
    const res = await wordpressAuthedFetch(`/posts?categories=${categoryId}&per_page=100&${statusParams}`, token);
    if (!res.ok) return [];
    return (await res.json()) as WpPostRaw[];
  } catch {
    return [];
  }
}

function mapPost(post: WpPostRaw): { item: AdminRpaeListItem; meta: RpaeSubmissionMeta } {
  const content = decodeHtmlEntities(post.content.rendered);
  const meta = parseRpaeMetadata(content);
  const title = meta.titreArticle || stripHtml(post.title.rendered).replace(/^\[RPAE\]\s*/i, "").trim();

  return {
    item: {
      id: String(post.id),
      title,
      auteur: authorDisplayName(meta),
      profilLabel: profilLabel(meta.profilAuteur),
      theme: meta.theme ?? "Non renseigné",
      editionAnnee: meta.editionAnnee,
      year: resolveArticleYear(meta, post.date),
      date: post.date,
      status: post.status,
      usage: meta.usage ?? "publication",
    },
    meta,
  };
}

export async function listRpaeSubmissions(): Promise<AdminRpaeListItem[]> {
  const session = await getAdminSession();
  if (!session) return [];

  const [publicId, internalId] = await Promise.all([
    findCategoryId(session.token, RPAE_CATEGORY_SLUG),
    findCategoryId(session.token, RPAE_INTERNAL_CATEGORY_SLUG),
  ]);
  const categoryIds = [publicId, internalId].filter((id): id is number => id !== null);

  const postLists = await Promise.all(categoryIds.map((id) => fetchPostsByCategory(session.token, id)));
  const seen = new Set<number>();
  const merged: WpPostRaw[] = [];
  for (const list of postLists) {
    for (const post of list) {
      if (seen.has(post.id)) continue;
      seen.add(post.id);
      merged.push(post);
    }
  }

  return merged
    .map((post) => mapPost(post).item)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getRpaeSubmission(id: string): Promise<AdminRpaeDetail | null> {
  const session = await getAdminSession();
  if (!session) return null;

  try {
    const res = await wordpressAuthedFetch(`/posts/${id}`, session.token);
    if (!res.ok) return null;
    const post = (await res.json()) as WpPostRaw;
    const { item, meta } = mapPost(post);
    return { ...item, meta };
  } catch {
    return null;
  }
}
