import type { Indicator, InstitutionalPage, NewsArticle, Partner, Publication, PublicationCard } from "./types";
import { mockIndicators, mockNews, mockPartners, mockPublicationCards, mockPublications } from "./mock-data";
import { decodeHtmlEntities } from "./decodeHtml";
import { extractImages } from "./extractImages";
import type { Locale } from "./i18n/config";
import {
  needsAutoTranslation,
  translateHtmlFrToEn,
  translateTextFrToEn,
} from "./i18n/auto-translate";
import {
  authorDisplayName,
  isInternalRpaeUsage,
  mockRpaeArticles,
  parseRpaeMetadata,
  profilLabel,
  resolveArticleYear,
  RPAE_CATEGORY_SLUG,
  type RpaeArticle,
} from "./rpae";
import { institutionalPageFallback } from "./institutional-fallbacks";
import { WP_BROWSER_HEADERS } from "./wordpress-headers";


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

type WpFetchOptions = {
  /**
   * true = pas de Data Cache (obligatoire pour les lookups `?slug=` :
   * un `[]` mis en cache avant la création de `mission-en` bloquait l'anglais).
   */
  fresh?: boolean;
};

async function fetchFromWordpress<T>(path: string, options: WpFetchOptions = {}): Promise<T | null> {
  if (!WORDPRESS_API_URL) return null;

  const url = `${WORDPRESS_API_URL}${path}`;
  try {
    const res = await fetch(
      url,
      options.fresh
        ? { cache: "no-store", headers: WP_BROWSER_HEADERS }
        : { next: { revalidate: 300, tags: ["wordpress"] }, headers: WP_BROWSER_HEADERS },
    );

    // --- DIAGNOSTIC TEMPORAIRE (à retirer une fois la cause identifiée) ---
    // On a confirmé que fetch() reçoit un statut OK mais un corps HTML au
    // lieu du JSON attendu (pare-feu de l'hébergement ?) — on inspecte donc
    // les en-têtes de réponse et le début du corps avant tout traitement.
    const allHeaders: string[] = [];
    res.headers.forEach((value, key) => allHeaders.push(`${key}: ${value}`));
    const notableHeaders = allHeaders.filter((line) => /^(server|cf-|x-|set-cookie)/i.test(line));
    console.info(`[wordpress][debug] ${url} -> statut HTTP ${res.status}`);
    console.info(
      `[wordpress][debug] ${url} -> en-têtes notables (server/cf-/x-/set-cookie) :\n${
        notableHeaders.join("\n") || "(aucun)"
      }`,
    );
    console.info(`[wordpress][debug] ${url} -> tous les en-têtes :\n${allHeaders.join("\n")}`);
    // --- fin diagnostic temporaire ---

    if (!res.ok) {
      console.warn(`[wordpress] ${url} -> HTTP ${res.status}, repli sur les données mock`);
      return null;
    }

    const rawBody = await res.text();

    // --- DIAGNOSTIC TEMPORAIRE (à retirer une fois la cause identifiée) ---
    console.info(
      `[wordpress][debug] ${url} -> 1000 premiers caractères du corps :\n${rawBody.slice(0, 1000)}`,
    );
    // --- fin diagnostic temporaire ---

    try {
      const parsed = JSON.parse(rawBody) as T;
      console.info(`[wordpress] ${url} -> OK`);
      return parsed;
    } catch (parseError) {
      console.warn(`[wordpress] ${url} -> réponse non-JSON, repli sur les données mock`, parseError);
      return null;
    }
  } catch (error) {
    console.warn(`[wordpress] ${url} -> échec de connexion, repli sur les données mock`, error);
    return null;
  }
}

// --- Mapping du format natif WordPress (endpoint /posts) -----------------

type WpRenderedField = { rendered: string };

type WpTerm = { id: number; name: string; slug: string };

type WpMedia = {
  source_url: string;
  media_details?: {
    width?: number;
    height?: number;
    sizes?: Record<string, { source_url?: string; width?: number; height?: number }>;
  };
};

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

/**
 * Premier lien vers un .pdf trouvé dans du contenu WordPress, pour la
 * miniature du carrousel — tolère un ?query ou #fragment après ".pdf"
 * (ex. liens de l'ancien site avec un paramètre de téléchargement).
 */
function extractFirstPdfUrl(html: string): string | undefined {
  const match = html.match(/<a[^>]+href="([^"]+\.pdf(?:[?#][^"]*)?)"[^>]*>/i);
  return match?.[1];
}

/** Préfère l’URL originale WP (évite les miniatures floues dans le bandeau). */
function bestImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.replace(/-\d{2,4}x\d{2,4}(?=\.(?:jpe?g|png|webp|gif)(?:\?|$))/i, "");
}

function featuredCover(media?: WpMedia): { url: string; width?: number; height?: number } | undefined {
  if (!media) return undefined;
  const full = media.media_details?.sizes?.full;
  const large = media.media_details?.sizes?.large;
  const url = bestImageUrl(full?.source_url || large?.source_url || media.source_url);
  if (!url) return undefined;
  return {
    url,
    width: full?.width ?? media.media_details?.width,
    height: full?.height ?? media.media_details?.height,
  };
}

/** Slug public : `mission-en` → `mission` (l’URL EN reste `/en/mission`). */
function publicSlug(slug: string): string {
  return slug.replace(/-en$/i, "");
}

function categoryForLocale(name: string, locale: Locale): string {
  if (locale !== "en") return name;
  const labels: Record<string, string> = {
    Actualité: "News",
    Actualites: "News",
    Actualités: "News",
    Conjoncture: "Business cycle",
    "Finances publiques": "Public finances",
    International: "International",
  };
  return labels[name] ?? name;
}

function mapWpPostToNewsArticle(post: WpPost, locale: Locale = "fr", isLocaleFallback = false): NewsArticle {
  const content = decodeHtmlEntities(post.content.rendered);
  const featured = featuredCover(post._embedded?.["wp:featuredmedia"]?.[0]);
  const fromContent = bestImageUrl(extractImages(content).images[0]?.src);
  const categoryName = decodeHtmlEntities(post._embedded?.["wp:term"]?.[0]?.[0]?.name ?? "Actualité");
  return {
    id: String(post.id),
    slug: publicSlug(post.slug),
    title: stripHtml(post.title.rendered),
    category: categoryForLocale(categoryName, locale),
    excerpt: stripHtml(post.excerpt.rendered),
    date: post.date,
    coverImage: featured?.url || fromContent,
    coverWidth: featured?.width,
    coverHeight: featured?.height,
    content,
    isLocaleFallback,
  };
}

// --- Mapping du format natif WordPress (endpoint /pages) -----------------

type WpPage = {
  id: number;
  slug: string;
  date: string;
  modified: string;
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
    modified: page.modified,
  };
}

// --- API publique ----------------------------------------------------------

export async function getNews(locale: Locale = "fr"): Promise<NewsArticle[]> {
  const data = await fetchFromWordpress<WpPost[]>("/posts?_embed&per_page=50");
  if (!data) return mockNews.map((article) => ({ ...article, isLocaleFallback: locale === "en" }));
  const englishPosts = data.filter(postIsEnglish);
  const frenchPosts = data.filter((post) => !postIsEnglish(post));
  if (locale === "en" && englishPosts.length > 0) {
    const mapped = englishPosts.map((post) => mapWpPostToNewsArticle(post, locale, false));
    return Promise.all(
      mapped.map(async (article) =>
        article.content && needsAutoTranslation(article.content)
          ? autoTranslateArticleTeaser(article)
          : article,
      ),
    );
  }
  const source = frenchPosts.length > 0 ? frenchPosts : data;
  const mapped = source.map((post) => mapWpPostToNewsArticle(post, locale, locale === "en"));
  if (locale !== "en") return mapped;
  return Promise.all(mapped.map((article) => autoTranslateArticleTeaser(article)));
}

function postIsEnglish(post: WpPost): boolean {
  const terms = post._embedded?.["wp:term"]?.flat() ?? [];
  if (terms.some((term) => /^(en|english|news)$/i.test(term.slug))) return true;
  return /-en$/i.test(post.slug);
}

/**
 * Convention éditeurs WordPress (versions anglaises) :
 * - Pages : slug `{slug-fr}-en` (ex. `mission` → `mission-en`).
 * - Actualités : même suffixe `-en`, et/ou catégorie dont le slug est `en`, `english` ou `news`.
 * Si la version EN éditoriale manque (ou n’est qu’une copie FR non traduite),
 * le site traduit automatiquement le français à l’affichage — pas de textes EN en dur dans Next.js.
 */
async function autoTranslatePage(page: InstitutionalPage): Promise<InstitutionalPage> {
  const [title, content] = await Promise.all([
    translateTextFrToEn(page.title),
    translateHtmlFrToEn(page.content),
  ]);
  return { ...page, title, content, isLocaleFallback: false };
}

async function autoTranslateArticle(article: NewsArticle): Promise<NewsArticle> {
  const [title, excerpt, content] = await Promise.all([
    translateTextFrToEn(article.title),
    translateTextFrToEn(article.excerpt),
    article.content ? translateHtmlFrToEn(article.content) : Promise.resolve(article.content),
  ]);
  return { ...article, title, excerpt, content, isLocaleFallback: false };
}

/** Liste d’actus : titres/extraits seulement (évite de saturer l’API de traduction). */
async function autoTranslateArticleTeaser(article: NewsArticle): Promise<NewsArticle> {
  const [title, excerpt] = await Promise.all([
    translateTextFrToEn(article.title),
    translateTextFrToEn(article.excerpt),
  ]);
  return { ...article, title, excerpt, isLocaleFallback: false };
}

const MIN_BANNER_WIDTH = 800;

/** Couvertures d’actualités assez grandes pour le bandeau (pas les galeries). */
export function buildNewsBannerSlides(articles: NewsArticle[], limit = 8): NewsArticle[] {
  const seen = new Set<string>();
  const slides: NewsArticle[] = [];
  const sorted = [...articles]
    .filter((article) => !/rpae/i.test(article.category))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const article of sorted) {
    if (!isBannerCover(article) || !article.coverImage) continue;
    const key = imageKey(article.coverImage);
    if (seen.has(key)) continue;
    seen.add(key);
    slides.push({ ...article, id: `${article.id}-banner` });
    if (slides.length >= limit) break;
  }

  return slides;
}

function isBannerCover(article: NewsArticle): boolean {
  if (!article.coverImage || !isBannerWorthyImage(article.coverImage)) return false;
  if (article.coverWidth == null) return article.coverImage.startsWith("/");
  if (article.coverWidth < MIN_BANNER_WIDTH) return false;
  if (article.coverHeight != null && article.coverHeight > article.coverWidth) return false;
  return true;
}

function imageKey(url: string): string {
  return (bestImageUrl(url) ?? url)
    .replace(/-\d{2,4}x\d{2,4}(?=(?:-\d+)?\.(?:jpe?g|png|webp|gif)(?:\?|$))/i, "")
    .toLowerCase();
}

function isBannerWorthyImage(url: string): boolean {
  if (/\.svg(?:\?|$)/i.test(url)) return false;
  if (/\/(?:logo|icon|emoji|smiley|avatar|gravatar)/i.test(url)) return false;
  return true;
}

export async function getNewsBySlug(slug: string, locale: Locale = "fr"): Promise<NewsArticle | null> {
  const bare = publicSlug(slug);
  if (locale !== "en") {
    const data = await fetchFromWordpress<WpPost[]>(
      `/posts?slug=${encodeURIComponent(bare)}&_embed`,
      { fresh: true },
    );
    if (data?.[0]) return mapWpPostToNewsArticle(data[0], locale, false);
    const mock = mockNews.find((article) => article.slug === bare || article.slug === slug);
    return mock ?? null;
  }

  const enData = await fetchFromWordpress<WpPost[]>(
    `/posts?slug=${encodeURIComponent(`${bare}-en`)}&_embed`,
    { fresh: true },
  );
  const frData = await fetchFromWordpress<WpPost[]>(
    `/posts?slug=${encodeURIComponent(bare)}&_embed`,
    { fresh: true },
  );

  if (enData?.[0]) {
    const article = mapWpPostToNewsArticle(enData[0], locale, false);
    if (article.content && !needsAutoTranslation(article.content)) {
      return article;
    }
  }

  const frSource =
    (frData?.[0] && mapWpPostToNewsArticle(frData[0], "fr", false)) ||
    (enData?.[0] && mapWpPostToNewsArticle(enData[0], locale, false)) ||
    mockNews.find((article) => article.slug === bare || article.slug === slug);

  if (!frSource) return null;
  return autoTranslateArticle({ ...frSource, slug: bare });
}

/**
 * Page de contenu institutionnel (wp/v2/pages) — ex. "Mot du Directeur
 * National". Renvoie null si la page n'existe pas côté WordPress OU si son
 * contenu réel (une fois les balises retirées) est vide, pour que
 * l'appelant retombe sur PageEnConstruction dans les deux cas.
 */
export async function getPageBySlug(slug: string, locale: Locale = "fr"): Promise<InstitutionalPage | null> {
  const bare = publicSlug(slug);
  if (locale !== "en") {
    const data = await fetchFromWordpress<WpPage[]>(
      `/pages?slug=${encodeURIComponent(bare)}&_embed`,
      { fresh: true },
    );
    if (!data?.[0]) return institutionalPageFallback(bare);
    const page = mapWpPageToInstitutionalPage(data[0]);
    return stripHtml(page.content).length > 0 ? page : institutionalPageFallback(bare);
  }

  const enData = await fetchFromWordpress<WpPage[]>(
    `/pages?slug=${encodeURIComponent(`${bare}-en`)}&_embed`,
    { fresh: true },
  );
  const frData = await fetchFromWordpress<WpPage[]>(
    `/pages?slug=${encodeURIComponent(bare)}&_embed`,
    { fresh: true },
  );

  if (enData?.[0]) {
    const enPage = mapWpPageToInstitutionalPage(enData[0]);
    if (stripHtml(enPage.content).length > 0 && !needsAutoTranslation(enPage.content)) {
      return { ...enPage, isLocaleFallback: false };
    }
  }

  const frPage = frData?.[0] ? mapWpPageToInstitutionalPage(frData[0]) : null;
  if (frPage && stripHtml(frPage.content).length > 0) {
    return autoTranslatePage(frPage);
  }

  if (enData?.[0]) {
    const enPage = mapWpPageToInstitutionalPage(enData[0]);
    if (stripHtml(enPage.content).length > 0) {
      return autoTranslatePage(enPage);
    }
  }

  return institutionalPageFallback(bare);
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
  { slug: "transition-fiscale", href: "/transition-fiscale", fallbackTitle: "Transition fiscale" },
  {
    slug: "perspectives-economiques-financieres",
    href: "/perspectives-economiques-financieres",
    fallbackTitle: "PEF — Perspectives économiques et financières",
  },
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
 * Sous-ensemble de PUBLICATION_PAGES affiché dans le mini-carrousel
 * "Conjoncture" de la page d'accueil (Hero) — les mêmes 5 pages que le
 * regroupement "Documents conjoncturels" du menu Publications
 * (lib/nav-data.ts:44-52) et de app/publications/documents-conjoncturels/page.tsx.
 * Dupliqué ici plutôt que factorisé avec ces deux fichiers : ceux-ci encodent
 * des hrefs de menu dans une structure imbriquée plus large, pas une liste de
 * slugs directement réutilisable.
 */
export const CONJONCTURE_SLUGS = new Set([
  "tableau-de-bord-mensuel-de-leconomie-guineenne-tbmeg",
  "rapport-regional-conjoncture",
  "note-hebdomadaire-economie-guineenne",
  "note-conjoncture-economique-guinee",
  "autres-notes-techniques",
]);

/**
 * Toutes les publications réellement publiées côté WordPress (cf.
 * PUBLICATION_PAGES), triées par date de dernière modification décroissante
 * — pour le carrousel de couvertures de la page d'accueil. Le tri se base
 * sur `modified` plutôt que `date` (création) : ce sont des pages-listes
 * éditées au fil du temps (ex. TBMEG, un nouveau mois ajouté chaque mois),
 * donc `modified` reflète bien mieux "mis à jour récemment" — `date` seule
 * placerait ces pages dans l'ordre où elles ont été créées la première fois,
 * ce qui peut sembler arbitraire si plusieurs ont été créées le même jour.
 * Si aucune page n'est publiée (API absente ou pages vides), repli sur les
 * cartes de démonstration pour que le Hero et le carrousel restent visibles.
 */
export async function getRecentPublicationCards(locale: Locale = "fr"): Promise<PublicationCard[]> {
  const results = await Promise.all(
    PUBLICATION_PAGES.map(async (entry) => {
      const page = await getPageBySlug(entry.slug, locale);
      if (!page) return null;
      const card: PublicationCard = {
        slug: entry.slug,
        href: entry.href,
        title: page.title || entry.fallbackTitle,
        date: page.modified || page.date || "",
        pdfUrl: extractFirstPdfUrl(page.content),
        coverImage: page.coverImage,
      };
      return card;
    }),
  );
  const cards = results
    .filter((card): card is PublicationCard => card !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return cards.length > 0 ? cards : mockPublicationCards;
}

const TICKER_MAX_ITEMS = 10;

/**
 * Titres pour le bandeau défilant de l'en-tête — fusionne actualités et
 * publications récentes, tous types confondus, triés par date décroissante.
 * Liste vide si aucun contenu n'est disponible ; c'est à l'appelant de
 * prévoir un repli (voir components/layout/Ticker.tsx).
 */
export async function getTickerAnnouncements(locale: Locale = "fr"): Promise<string[]> {
  const [news, publications] = await Promise.all([getNews(locale), getRecentPublicationCards(locale)]);
  const merged = [
    ...news.map((article) => ({ title: article.title, date: article.date })),
    ...publications.map((publication) => ({ title: publication.title, date: publication.date })),
  ];
  return merged
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, TICKER_MAX_ITEMS)
    .map((item) => item.title);
}

export async function getIndicators(): Promise<Indicator[]> {
  const data = await fetchFromWordpress<Indicator[]>("/indicateurs");
  return data ?? mockIndicators;
}

export async function getPartners(): Promise<Partner[]> {
  const data = await fetchFromWordpress<Partner[]>("/partenaires");
  return data ?? mockPartners;
}

function mapWpPostToRpaeArticle(post: WpPost): RpaeArticle | null {
  const content = decodeHtmlEntities(post.content.rendered);
  const meta = parseRpaeMetadata(content);
  // Hors catalogue : usage interne / commande (phase 4).
  if (isInternalRpaeUsage(meta.usage)) return null;

  // Un article RPAE doit au moins porter les métadonnées de soumission
  // (ou le préfixe de titre) — évite d'afficher des posts hors revue.
  const looksLikeRpae =
    !!meta.titreArticle ||
    !!meta.profilAuteur ||
    !!meta.theme ||
    stripHtml(post.title.rendered).startsWith("[RPAE]");
  if (!looksLikeRpae) return null;

  const title =
    meta.titreArticle ||
    stripHtml(post.title.rendered).replace(/^\[RPAE\]\s*/i, "").trim();

  return {
    id: String(post.id),
    slug: post.slug,
    title,
    date: post.date,
    year: resolveArticleYear(meta, post.date),
    auteur: authorDisplayName(meta),
    profil: meta.profilAuteur ?? "autre",
    profilLabel: profilLabel(meta.profilAuteur),
    theme: meta.theme ?? "Non renseigné",
    resume: meta.resume ?? stripHtml(post.excerpt.rendered).slice(0, 400),
    editionAnnee: meta.editionAnnee,
    gradeAuteur: meta.gradeAuteur,
    fonctionAuteur: meta.fonctionAuteur,
    fichierUrl: meta.fichierUrl,
    fichierNom: meta.fichierNom,
  };
}

/**
 * Articles RPAE publiés (catégorie `rpae`) — pour le catalogue public.
 * Repli mock si l'API est absente ou qu'aucun article n'est encore publié.
 */
export async function getPublishedRpaeArticles(): Promise<RpaeArticle[]> {
  const cats = await fetchFromWordpress<{ id: number; slug: string }[]>(
    `/categories?slug=${encodeURIComponent(RPAE_CATEGORY_SLUG)}`,
  );
  const categoryId = cats?.[0]?.id;

  let posts: WpPost[] | null = null;
  if (categoryId) {
    posts = await fetchFromWordpress<WpPost[]>(
      `/posts?categories=${categoryId}&per_page=50&_embed`,
    );
  }
  if (!posts || posts.length === 0) {
    // Repli : recherche par préfixe de titre (cas où la catégorie manque).
    posts = await fetchFromWordpress<WpPost[]>(`/posts?search=${encodeURIComponent("RPAE")}&per_page=50`);
  }

  const articles = (posts ?? [])
    .map(mapWpPostToRpaeArticle)
    .filter((article): article is RpaeArticle => article !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return articles.length > 0 ? articles : mockRpaeArticles;
}

export async function getRpaeArticleBySlug(slug: string): Promise<RpaeArticle | null> {
  const data = await fetchFromWordpress<WpPost[]>(`/posts?slug=${encodeURIComponent(slug)}`);
  if (data?.[0]) {
    const mapped = mapWpPostToRpaeArticle(data[0]);
    if (mapped) return mapped;
  }
  return mockRpaeArticles.find((article) => article.slug === slug) ?? null;
}

export type { RpaeArticle };
