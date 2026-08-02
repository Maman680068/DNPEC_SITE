/**
 * Métadonnées RPAE — encodées en commentaires HTML dans le contenu WordPress
 * (même convention que les soumissions : <!-- rpae:clé valeur -->).
 *
 * Workflow option A (comité dans WordPress) :
 * 1. Soumission site → post WP status "pending" + catégorie adaptée
 *    - usage « publication » → catégorie `rpae` (catalogue public après Publish)
 *    - usage « interne » / « commande » → catégorie `rpae-interne` (jamais catalogue)
 * 2. Comité WP : Articles → En attente de relecture → analyser le fichier
 * 3. Accepter (publication) → Publier le post (status "publish")
 * 4. Refuser → brouillon + <!-- rpae:statut-soumission refuse -->
 * 5. Usage interne / commande : laisser en privé / brouillon, ou publier
 *    uniquement dans `rpae-interne` (exclu du site public)
 *
 * Phase 3 : posts "publish" de la catégorie `rpae` → /revue-scientifique
 * Phase 4 : catégorie `rpae-interne` hors catalogue public
 */

export const RPAE_CATEGORY_SLUG = "rpae";
export const RPAE_INTERNAL_CATEGORY_SLUG = "rpae-interne";

export const RPAE_USAGE_LABELS: Record<string, string> = {
  publication: "Publication dans la revue (catalogue public)",
  interne: "Usage interne DNPEC (non publié sur le site)",
  commande: "Travail sur commande (non publié sur le site)",
};

export type RpaeUsage = keyof typeof RPAE_USAGE_LABELS;

export const RPAE_PROFIL_LABELS: Record<string, string> = {
  etudiant: "Étudiant(e)",
  expert: "Expert / chercheur",
  docteur: "Docteur",
  professeur: "Professeur",
  autre: "Autre",
};

export type RpaeProfil = keyof typeof RPAE_PROFIL_LABELS;

/** Statuts métier stockés dans <!-- rpae:statut-soumission … --> */
export type RpaeStatutSoumission =
  | "soumis"
  | "en-analyse"
  | "accepte"
  | "refuse"
  | "publie"
  | "interne";

export type RpaeSubmissionMeta = {
  nomAuteur?: string;
  prenomAuteur?: string;
  emailAuteur?: string;
  telephoneAuteur?: string;
  nationaliteAuteur?: string;
  profilAuteur?: string;
  gradeAuteur?: string;
  fonctionAuteur?: string;
  theme?: string;
  editionAnnee?: string;
  titreArticle?: string;
  resume?: string;
  fichierUrl?: string;
  fichierNom?: string;
  statutSoumission?: string;
  usage?: string;
};

/** Article RPAE publié, prêt pour l'affichage public (sans e-mail auteur). */
export type RpaeArticle = {
  id: string;
  slug: string;
  title: string;
  date: string;
  year: number;
  auteur: string;
  profil: string;
  profilLabel: string;
  theme: string;
  resume: string;
  editionAnnee?: string;
  gradeAuteur?: string;
  fonctionAuteur?: string;
  fichierUrl?: string;
  fichierNom?: string;
};

export function authorDisplayName(meta: RpaeSubmissionMeta): string {
  const parts = [meta.prenomAuteur, meta.nomAuteur].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Auteur non renseigné";
}

export function resolveArticleYear(meta: RpaeSubmissionMeta, postDate: string): number {
  const fromEdition = meta.editionAnnee?.match(/\d{4}/)?.[0];
  if (fromEdition) return Number(fromEdition);
  const fromDate = new Date(postDate).getFullYear();
  return Number.isFinite(fromDate) ? fromDate : new Date().getFullYear();
}

/**
 * Cartes de démonstration — utilisées tant qu'aucun article RPAE n'est
 * publié côté WordPress (catégorie `rpae`, status publish).
 */
export const mockRpaeArticles: RpaeArticle[] = [
  {
    id: "mock-1",
    slug: "inflation-et-pouvoir-achat-en-guinee-2025",
    title: "Inflation et pouvoir d'achat en Guinée : une analyse conjoncturelle",
    date: "2026-03-15",
    year: 2026,
    auteur: "Aïssatou Diallo",
    profil: "etudiant",
    profilLabel: "Étudiant(e)",
    theme: "Inflation",
    resume:
      "Cette étude examine la dynamique de l'inflation guinéenne et ses effets sur le pouvoir d'achat des ménages entre 2023 et 2025.",
    editionAnnee: "2026",
    gradeAuteur: "Master 2",
    fichierUrl: "/rpae-exemples/inflation-et-pouvoir-achat-en-guinee-2025.docx",
    fichierNom: "inflation-et-pouvoir-achat-en-guinee-2025.docx",
  },
  {
    id: "mock-2",
    slug: "finances-publiques-et-soutenabilite-de-la-dette",
    title: "Finances publiques et soutenabilité de la dette en Guinée",
    date: "2026-01-20",
    year: 2026,
    auteur: "Dr. Mamadou Camara",
    profil: "docteur",
    profilLabel: "Docteur",
    theme: "Finances publiques",
    resume:
      "Analyse de la trajectoire d'endettement public et des marges de manœuvre budgétaires à moyen terme.",
    editionAnnee: "2026",
    gradeAuteur: "PhD",
    fichierUrl: "/rpae-exemples/finances-publiques-et-soutenabilite-de-la-dette.docx",
    fichierNom: "finances-publiques-et-soutenabilite-de-la-dette.docx",
  },
  {
    id: "mock-3",
    slug: "secteur-minier-et-recettes-fiscales",
    title: "Secteur minier et recettes fiscales : quels leviers pour l'État ?",
    date: "2025-11-08",
    year: 2025,
    auteur: "Prof. Fatoumata Bah",
    profil: "professeur",
    profilLabel: "Professeur",
    theme: "Secteur minier",
    resume:
      "Contribution sur le lien entre exploitation minière, fiscalité et capacité de financement des politiques publiques.",
    editionAnnee: "2025",
    fichierUrl: "/rpae-exemples/secteur-minier-et-recettes-fiscales.docx",
    fichierNom: "secteur-minier-et-recettes-fiscales.docx",
  },
];

function extractRpaeField(html: string, key: string): string | undefined {
  const match = html.match(new RegExp(`<!--\\s*rpae:${key}\\s+([\\s\\S]*?)\\s*-->`, "i"));
  return match?.[1]?.trim() || undefined;
}

export function parseRpaeMetadata(html: string): RpaeSubmissionMeta {
  return {
    nomAuteur: extractRpaeField(html, "nom-auteur"),
    prenomAuteur: extractRpaeField(html, "prenom-auteur"),
    emailAuteur: extractRpaeField(html, "email-auteur"),
    telephoneAuteur: extractRpaeField(html, "telephone-auteur"),
    nationaliteAuteur: extractRpaeField(html, "nationalite-auteur"),
    profilAuteur: extractRpaeField(html, "profil-auteur"),
    gradeAuteur: extractRpaeField(html, "grade-auteur"),
    fonctionAuteur: extractRpaeField(html, "fonction-auteur"),
    theme: extractRpaeField(html, "theme"),
    editionAnnee: extractRpaeField(html, "edition-annee"),
    titreArticle: extractRpaeField(html, "titre-article"),
    resume: extractRpaeField(html, "resume"),
    fichierUrl: extractRpaeField(html, "fichier-url"),
    fichierNom: extractRpaeField(html, "fichier-nom"),
    statutSoumission: extractRpaeField(html, "statut-soumission"),
    usage: extractRpaeField(html, "usage"),
  };
}

export function profilLabel(profil: string | undefined): string {
  if (!profil) return "Non renseigné";
  return RPAE_PROFIL_LABELS[profil] ?? profil;
}

export function usageLabel(usage: string | undefined): string {
  if (!usage) return RPAE_USAGE_LABELS.publication;
  return RPAE_USAGE_LABELS[usage] ?? usage;
}

/** True si l'article ne doit jamais apparaître dans le catalogue public. */
export function isInternalRpaeUsage(usage: string | undefined): boolean {
  return usage === "interne" || usage === "commande";
}

type EnsureCategoryOptions = {
  slug: string;
  name: string;
  description: string;
};

/**
 * Récupère ou crée une catégorie WordPress.
 * Renvoie null si l'API refuse (droits insuffisants).
 */
export async function ensureWpCategoryId(
  wpApiUrl: string,
  authHeader: string,
  options: EnsureCategoryOptions,
): Promise<number | null> {
  try {
    const listRes = await fetch(
      `${wpApiUrl}/categories?slug=${encodeURIComponent(options.slug)}`,
      { headers: { Authorization: authHeader }, cache: "no-store" },
    );
    if (listRes.ok) {
      const existing = (await listRes.json()) as { id: number }[];
      if (existing[0]?.id) return existing[0].id;
    }

    const createRes = await fetch(`${wpApiUrl}/categories`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: options.name,
        slug: options.slug,
        description: options.description,
      }),
    });
    if (!createRes.ok) {
      console.warn(`[rpae] création catégorie ${options.slug} impossible — HTTP ${createRes.status}`);
      return null;
    }
    const created = (await createRes.json()) as { id: number };
    return created.id ?? null;
  } catch (error) {
    console.warn(`[rpae] échec ensureWpCategoryId(${options.slug})`, error);
    return null;
  }
}

/** Catégorie publique RPAE (catalogue /revue-scientifique). */
export async function ensureRpaeCategoryId(
  wpApiUrl: string,
  authHeader: string,
): Promise<number | null> {
  return ensureWpCategoryId(wpApiUrl, authHeader, {
    slug: RPAE_CATEGORY_SLUG,
    name: "RPAE",
    description: "Articles de la Revue des Prévisions et Analyses Économiques — file comité DNPEC",
  });
}

/** Catégorie hors catalogue (usage interne / commande). */
export async function ensureRpaeInternalCategoryId(
  wpApiUrl: string,
  authHeader: string,
): Promise<number | null> {
  return ensureWpCategoryId(wpApiUrl, authHeader, {
    slug: RPAE_INTERNAL_CATEGORY_SLUG,
    name: "RPAE interne",
    description:
      "Travaux RPAE à usage interne ou sur commande — exclus du catalogue public /revue-scientifique",
  });
}
