import type { Indicator, InstitutionalPage, NewsArticle, Partner, Publication, PublicationCard } from "./types";
import { mockIndicators, mockNews, mockPartners, mockPublications } from "./mock-data";
import { decodeHtmlEntities } from "./decodeHtml";

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

/** Retire les balises HTML et décode les entités — utilisé pour les champs texte brut (titre, extrait). */
function stripHtml(html: string): string {
  return decodeHtmlEntities(html)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Premier lien se terminant par .pdf trouvé dans du contenu WordPress, pour la miniature du carrousel. */
function extractFirstPdfUrl(html: string): string | undefined {
  const match = html.match(/<a[^>]+href="([^"]+\.pdf)"[^>]*>/i);
  return match?.[1];
}

function mapWpPostToNewsArticle(post: WpPost): NewsArticle {
  return {
    id: String(post.id),
    slug: post.slug,
    title: stripHtml(post.title.rendered),
    category: decodeHtmlEntities(post._embedded?.["wp:term"]?.[0]?.[0]?.name ?? "Actualité"),
    excerpt: stripHtml(post.excerpt.rendered),
    date: post.date,
    coverImage: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
    content: decodeHtmlEntities(post.content.rendered),
  };
}

// --- Mapping du format natif WordPress (endpoint /pages) -----------------

type WpPage = {
  id: number;
  slug: string;
  date: string;
  title: WpRenderedField;
  content: WpRenderedField;
  _embedded?: {
    "wp:featuredmedia"?: WpMedia[];
  };
};

function mapWpPageToInstitutionalPage(page: WpPage): InstitutionalPage {
  return {
    title: stripHtml(page.title.rendered),
    content: decodeHtmlEntities(page.content.rendered),
    coverImage: page._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
    date: page.date,
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

/**
 * Page de contenu institutionnel (wp/v2/pages) — ex. "Mot du Directeur
 * National". Renvoie null si la page n'existe pas côté WordPress OU si son
 * contenu réel (une fois les balises retirées) est vide, pour que
 * l'appelant retombe sur PageEnConstruction dans les deux cas.
 */
export async function getPageBySlug(slug: string): Promise<InstitutionalPage | null> {
  const data = await fetchFromWordpress<WpPage[]>(`/pages?slug=${encodeURIComponent(slug)}&_embed`);
  if (!data || data.length === 0) return null;
  const page = mapWpPageToInstitutionalPage(data[0]);
  return stripHtml(page.content).length > 0 ? page : null;
}

export async function getPublications(): Promise<Publication[]> {
  const data = await fetchFromWordpress<Publication[]>("/publications?_embed");
  return data ?? mockPublications;
}

/**
 * Catalogue des pages de documents/publications (menu "Publications") —
 * chacune correspond à une page wp/v2/pages potentiellement publiée
 * indépendamment. Sert de bassin de candidats pour le carrousel de la page
 * d'accueil : celles sans contenu réel publié sont simplement ignorées.
 */
const PUBLICATION_PAGES: { slug: string; href: string; fallbackTitle: string }[] = [
  { slug: "tableau-de-bord-mensuel-de-leconomie-guineenne-tbmeg", href: "/tbmeg", fallbackTitle: "TBMEG" },
  { slug: "tbfp", href: "/tbfp", fallbackTitle: "TBFP" },
  { slug: "tofe", href: "/tofe", fallbackTitle: "TOFE" },
  { slug: "rapport-regional-conjoncture", href: "/rapport-regional-conjoncture", fallbackTitle: "Rapport régional de conjoncture (RRC)" },
  { slug: "note-hebdomadaire-economie-guineenne", href: "/note-hebdomadaire-economie-guineenne", fallbackTitle: "Note hebdomadaire de l'économie guinéenne" },
  { slug: "note-conjoncture-economique-guinee", href: "/note-conjoncture-economique-guinee", fallbackTitle: "Note de conjoncture économique de la Guinée" },
  { slug: "autres-notes-techniques", href: "/autres-notes-techniques", fallbackTitle: "Autres notes techniques" },
  { slug: "documents-integration-regionale", href: "/documents-integration-regionale", fallbackTitle: "Documents de suivi de l'intégration économique régionale" },
  { slug: "documents-politique-economique", href: "/documents-politique-economique", fallbackTitle: "Documents de politique économique" },
  { slug: "rapports-analyses-etudes", href: "/rapports-analyses-etudes", fallbackTitle: "Rapports" },
  {
    slug: "rapport-cpia-comite-devaluation-des-politiques-et-institutions-nationales",
    href: "/rapport-cpia",
    fallbackTitle: "Rapport CPIA",
  },
  { slug: "rapport-economique-et-financier-ref", href: "/rapport-economique-financier", fallbackTitle: "Rapport économique et financier (REF)" },
  { slug: "note-trimestrielle-analyse-economique", href: "/note-trimestrielle-analyse-economique", fallbackTitle: "Note trimestrielle d'analyse économique" },
  { slug: "autres-etudes-economiques", href: "/autres-etudes-economiques", fallbackTitle: "Autres études" },
  { slug: "documents-travail", href: "/documents-travail", fallbackTitle: "Documents de travail" },
  { slug: "documents-statistiques", href: "/documents-statistiques", fallbackTitle: "Documents statistiques" },
];

/**
 * Publications les plus récentes parmi celles réellement publiées côté
 * WordPress (cf. PUBLICATION_PAGES), triées par date décroissante — pour le
 * carrousel de couvertures de la page d'accueil. Ignore silencieusement les
 * pages pas encore publiées plutôt que de renvoyer un repli mock.
 */
export async function getRecentPublicationCards(limit = 6): Promise<PublicationCard[]> {
  const results = await Promise.all(
    PUBLICATION_PAGES.map(async (entry) => {
      const page = await getPageBySlug(entry.slug);
      if (!page) return null;
      const card: PublicationCard = {
        slug: entry.slug,
        href: entry.href,
        title: page.title || entry.fallbackTitle,
        date: page.date ?? "",
        pdfUrl: extractFirstPdfUrl(page.content),
      };
      return card;
    }),
  );
  return results
    .filter((card): card is PublicationCard => card !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export async function getIndicators(): Promise<Indicator[]> {
  const data = await fetchFromWordpress<Indicator[]>("/indicateurs");
  return data ?? mockIndicators;
}

export async function getPartners(): Promise<Partner[]> {
  const data = await fetchFromWordpress<Partner[]>("/partenaires");
  return data ?? mockPartners;
}
