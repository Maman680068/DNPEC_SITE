export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  coverImage?: string;
  /** Contenu HTML complet (paragraphes conservés) — absent pour les données mock. */
  content?: string;
};

export type Publication = {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  year: number;
  fileUrl?: string;
  fileSizeKb?: number;
  /** Route de la catégorie correspondante — toutes ne vivent pas sous /publications/. */
  href?: string;
};

export type Indicator = {
  id: string;
  label: string;
  value: string;
  icon: string;
  tone: "green" | "yellow" | "red" | "navy";
  period: string;
};

export type Partner = {
  id: string;
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
};

/** Page de contenu institutionnel (endpoint WordPress wp/v2/pages). */
export type InstitutionalPage = {
  title: string;
  /** Contenu HTML complet (paragraphes conservés), entités déjà décodées. */
  content: string;
  coverImage?: string;
  /** Date de création WordPress (ISO 8601). */
  date?: string;
  /** Date de dernière modification WordPress (ISO 8601) — reflète mieux "récemment mis à jour" pour une page-liste éditée au fil du temps. */
  modified?: string;
};

/** Carte de publication récente, pour le carrousel de la page d'accueil. */
export type PublicationCard = {
  slug: string;
  href: string;
  title: string;
  /** Date utilisée pour le tri (modified de préférence, sinon date). */
  date: string;
  /** URL du premier lien PDF trouvé dans le contenu, pour la miniature. */
  pdfUrl?: string;
};

/**
 * Événement mis en avant sur la page d'accueil — encodé dans le contenu
 * WordPress via des commentaires HTML structurés (pas de champ personnalisé),
 * voir extractEventData() dans lib/wordpress.ts. Chaque champ est
 * indépendamment optionnel : la page peut n'en renseigner qu'une partie.
 */
export type EventData = {
  status?: string;
  dates?: string;
  theme?: string;
  speakerName?: string;
  speakerTitle?: string;
  speakerPhoto?: string;
};
