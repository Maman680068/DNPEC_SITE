import type { Indicator, NewsArticle, Partner, Publication } from "./types";
import { mockIndicators, mockNews, mockPartners, mockPublications } from "./mock-data";

/**
 * Couche d'accès au WordPress headless (back-office CMS).
 *
 * Tant que WORDPRESS_API_URL n'est pas défini (variable d'environnement),
 * chaque fonction retombe sur les données de démonstration de lib/mock-data.ts
 * afin que le site public reste fonctionnel en développement.
 *
 * Une fois le WordPress connecté, définir dans .env.local :
 *   WORDPRESS_API_URL=https://cms.dnpec.gov.gn/wp-json/wp/v2
 *
 * Voir README.md § "Connecter le WordPress headless" pour le détail des
 * endpoints attendus (actualites, publications, indicateurs, partenaires)
 * et le mapping des custom post types / ACF vers les types de lib/types.ts.
 */

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL;

async function fetchFromWordpress<T>(path: string): Promise<T | null> {
  if (!WORDPRESS_API_URL) return null;

  try {
    const res = await fetch(`${WORDPRESS_API_URL}${path}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getNews(): Promise<NewsArticle[]> {
  const data = await fetchFromWordpress<NewsArticle[]>("/actualites?_embed");
  return data ?? mockNews;
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const data = await fetchFromWordpress<NewsArticle[]>(`/actualites?slug=${slug}`);
  if (data && data.length > 0) return data[0];
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
