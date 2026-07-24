import type { Indicator, NewsArticle, Partner, Publication } from "./types";
import { mockIndicators, mockNews, mockPartners, mockPublications } from "./mock-data";

/**
 * Couche d'accès au WordPress headless (back-office CMS).
 *
 * Tant que WORDPRESS_API_URL n'est pas défini — ou si l'appel échoue —
 * chaque fonction retombe sur les données de démonstration de
 * lib/mock-data.ts, afin que le site public reste toujours fonctionnel.
 *
 * Définir dans .env.local (jamais commité, voir .gitignore) :
 *   WORDPRESS_API_URL=https://mon-wordpress.example.com/wp-json/wp/v2
 *
 * Voir README.md § "Connecter le WordPress headless" pour la configuration
 * détaillée (local, Render) et l'état actuel de chaque endpoint.
 *
 * État des endpoints :
 * - Actualités (getNews / getNewsBySlug) : branché sur /posts, l'endpoint
 *   natif de tout WordPress (aucune configuration serveur requise). C'est
 *   le seul type de contenu immédiatement disponible sur une installation
 *   neuve.
 * - Publications / Indicateurs / Partenaires : ciblent des endpoints
 *   dédiés (/publications, /indicateurs, /partenaires) qui n'existent pas
 *   sur une installation WordPress par défaut — ils nécessitent des custom
 *   post types (ou une route REST sur-mesure) côté back-office. Tant que ce
 *   n'est pas en place, ces endpoints répondent 404 et le repli sur les
 *   données mock est le comportement normal, pas une erreur.
 */

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL;

async function fetchFromWordpress<T>(path: string): Promise<T | null> {
  if (!WORDPRESS_API_URL) return null;

  const url = `${WORDPRESS_API_URL}${path}`;
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) {
      console.warn(`[wordpress] ${url} -> HTTP ${res.status}, repli sur les données mock`);
      return null;
    }
    console.info(`[wordpress] ${url} -> OK`);
    return (await res.json()) as T;
  } catch (error) {
    console.warn(`[wordpress] ${url} -> échec de connexion, repli sur les données mock`, error);
    return null;
  }
}

// --- Mapping du format natif WordPress (endpoint /posts) -----------------

type WpRenderedField = { rendered: string };

type WpTerm = { id: number; name: string; slug: string };

type WpMedia = { source_url: string };

type WpPost = {
  id: number;
  slug: string;
  date: string;
  title: WpRenderedField;
  excerpt: WpRenderedField;
  content: WpRenderedField;
  _embedded?: {
    "wp:term"?: WpTerm[][];
    "wp:featuredmedia"?: WpMedia[];
  };
};

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&nbsp;": " ",
  "&#8217;": "’",
  "&#8216;": "‘",
  "&#8220;": "“",
  "&#8221;": "”",
  "&#8211;": "–",
  "&#8212;": "—",
  "&#8230;": "…",
  "&hellip;": "…",
  "&eacute;": "é",
  "&Eacute;": "É",
  "&egrave;": "è",
  "&Egrave;": "È",
  "&agrave;": "à",
  "&Agrave;": "À",
  "&laquo;": "«",
  "&raquo;": "»",
};
const HTML_ENTITY_PATTERN = new RegExp(
  Object.keys(HTML_ENTITIES)
    .map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|"),
  "g",
);

/** Décode les entités HTML les plus courantes renvoyées par l'API WordPress, sans toucher aux balises. */
function decodeEntities(html: string): string {
  return html.replace(HTML_ENTITY_PATTERN, (m) => HTML_ENTITIES[m] ?? m);
}

/** Retire les balises HTML et décode les entités — utilisé pour les champs texte brut (titre, extrait). */
function stripHtml(html: string): string {
  return decodeEntities(html)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function mapWpPostToNewsArticle(post: WpPost): NewsArticle {
  return {
    id: String(post.id),
    slug: post.slug,
    title: stripHtml(post.title.rendered),
    category: post._embedded?.["wp:term"]?.[0]?.[0]?.name ?? "Actualité",
    excerpt: stripHtml(post.excerpt.rendered),
    date: post.date,
    coverImage: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
    content: decodeEntities(post.content.rendered),
  };
}

// --- API publique ----------------------------------------------------------

export async function getNews(): Promise<NewsArticle[]> {
  const data = await fetchFromWordpress<WpPost[]>("/posts?_embed&per_page=20");
  return data ? data.map(mapWpPostToNewsArticle) : mockNews;
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const data = await fetchFromWordpress<WpPost[]>(`/posts?slug=${encodeURIComponent(slug)}&_embed`);
  if (data && data.length > 0) return mapWpPostToNewsArticle(data[0]);
  return mockNews.find((article) => article.slug === slug) ?? null;
}

export async function getPublications(): Promise<Publication[]> {
  const data = await fetchFromWordpress<Publication[]>("/publications?_embed");
  return data ?? mockPublications;
}

export async function getIndicators(): Promise<Indicator[]> {
  const data = await fetchFromWordpress<Indicator[]>("/indicateurs");
  return data ?? mockIndicators;
}

export async function getPartners(): Promise<Partner[]> {
  const data = await fetchFromWordpress<Partner[]>("/partenaires");
  return data ?? mockPartners;
}
