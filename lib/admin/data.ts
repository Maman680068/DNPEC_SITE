import { getAdminSession } from "./session";
import { wordpressAuthedFetch } from "./wordpress-auth";
import { decodeHtmlEntities } from "@/lib/decodeHtml";

/**
 * Couche de lecture côté serveur pour l'espace contributeurs — utilisée
 * directement par les pages (Composants Serveur), sans repasser par les
 * routes /api/admin/* (celles-ci ne servent qu'aux actions déclenchées côté
 * client : créer, modifier, publier, rejeter).
 */

function stripHtml(html: string): string {
  return decodeHtmlEntities(html)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchJsonArray<T>(path: string, token: string): Promise<T[]> {
  try {
    const res = await wordpressAuthedFetch(path, token);
    if (!res.ok) return [];
    return (await res.json()) as T[];
  } catch {
    return [];
  }
}

async function fetchJsonOne<T>(path: string, token: string): Promise<T | null> {
  try {
    const res = await wordpressAuthedFetch(path, token);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// --- Actualités (natif /wp/v2/posts) ---------------------------------------

export type AdminActualiteListItem = {
  id: string;
  title: string;
  excerpt: string;
  status: string;
  date: string;
  authorName: string | null;
  categoryName: string | null;
  coverImage: string | null;
};

export type AdminActualiteDetail = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  status: string;
  categoryName: string | null;
  coverImage: string | null;
  featuredMediaId: number | null;
};

type WpPostRaw = {
  id: number;
  status: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  featured_media: number;
  _embedded?: {
    author?: { name: string }[];
    "wp:featuredmedia"?: { source_url: string }[];
    "wp:term"?: { name: string }[][];
  };
};

export async function listActualites(): Promise<AdminActualiteListItem[]> {
  const session = await getAdminSession();
  if (!session) return [];

  const statusParams = ["publish", "pending", "draft"].map((s) => `status[]=${s}`).join("&");
  const posts = await fetchJsonArray<WpPostRaw>(`/posts?per_page=100&_embed&${statusParams}`, session.token);

  return posts
    .map((post) => ({
      id: String(post.id),
      title: stripHtml(post.title.rendered),
      excerpt: stripHtml(post.excerpt.rendered),
      status: post.status,
      date: post.date,
      authorName: post._embedded?.author?.[0]?.name ?? null,
      categoryName: post._embedded?.["wp:term"]?.[0]?.[0]?.name ?? null,
      coverImage: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getActualite(id: string): Promise<AdminActualiteDetail | null> {
  const session = await getAdminSession();
  if (!session) return null;

  const post = await fetchJsonOne<WpPostRaw>(`/posts/${id}?_embed`, session.token);
  if (!post) return null;

  return {
    id: String(post.id),
    title: stripHtml(post.title.rendered),
    excerpt: stripHtml(post.excerpt.rendered),
    content: decodeHtmlEntities(post.content.rendered),
    status: post.status,
    categoryName: post._embedded?.["wp:term"]?.[0]?.[0]?.name ?? null,
    coverImage: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null,
    featuredMediaId: post.featured_media || null,
  };
}

// --- Publications / Indicateurs / Partenaires (mu-plugin) ------------------

export type AdminPublication = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type?: string;
  year?: number;
  fileUrl?: string;
  fileSizeKb?: number;
  href?: string;
  status: string;
  authorId: number;
  authorName?: string;
};

export type AdminIndicateur = {
  id: string;
  slug: string;
  label: string;
  value?: string;
  icon?: string;
  tone?: string;
  period?: string;
  status: string;
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
  authorId: number;
  authorName?: string;
};

async function listContent<T>(path: string): Promise<T[]> {
  const session = await getAdminSession();
  if (!session) return [];
  return fetchJsonArray<T>(path, session.token);
}

async function getContentOne<T>(path: string): Promise<T | null> {
  const session = await getAdminSession();
  if (!session) return null;
  return fetchJsonOne<T>(path, session.token);
}

export function listPublications(): Promise<AdminPublication[]> {
  return listContent<AdminPublication>("/publications");
}
export function getPublication(id: string): Promise<AdminPublication | null> {
  return getContentOne<AdminPublication>(`/publications/${id}`);
}

export function listIndicateurs(): Promise<AdminIndicateur[]> {
  return listContent<AdminIndicateur>("/indicateurs");
}
export function getIndicateur(id: string): Promise<AdminIndicateur | null> {
  return getContentOne<AdminIndicateur>(`/indicateurs/${id}`);
}

export function listPartenaires(): Promise<AdminPartenaire[]> {
  return listContent<AdminPartenaire>("/partenaires");
}
export function getPartenaire(id: string): Promise<AdminPartenaire | null> {
  return getContentOne<AdminPartenaire>(`/partenaires/${id}`);
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

export async function listJournal(): Promise<AdminJournalEntry[]> {
  return listContent<AdminJournalEntry>("/journal");
}
