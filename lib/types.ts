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
