export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  coverImage?: string;
  /** Dimensions de la couverture WordPress, pour filtrer le bandeau. */
  coverWidth?: number;
  coverHeight?: number;
  /** Contenu HTML complet (paragraphes conservés) — absent pour les données mock. */
  content?: string;
  /** true si la version anglaise n'existe pas encore et que le français est affiché. */
  isLocaleFallback?: boolean;
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
  /** true si la version anglaise n'existe pas encore et que le français est affiché. */
  isLocaleFallback?: boolean;
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
  /** Image de couverture optionnelle (Hero / carrousel). */
  coverImage?: string;
};
