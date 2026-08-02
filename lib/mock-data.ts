import type { Indicator, NewsArticle, Partner, Publication, PublicationCard } from "./types";

/**
 * Contenu de démonstration utilisé tant que le back-office WordPress headless
 * n'est pas connecté (voir lib/wordpress.ts). À remplacer par les données
 * réelles une fois l'API WordPress branchée — cf. README.
 */

export const mockIndicators: Indicator[] = [
  { id: "croissance", label: "Taux de croissance — 2025", value: "6,2 %", icon: "📈", tone: "green", period: "2025" },
  { id: "inflation", label: "Taux d'inflation — 2025", value: "7,8 %", icon: "🛒", tone: "yellow", period: "2025" },
  { id: "deficit", label: "Déficit budgétaire (% PIB)", value: "3,1 %", icon: "📊", tone: "red", period: "2025" },
  { id: "endettement", label: "Taux d'endettement (% PIB)", value: "38,4 %", icon: "💳", tone: "navy", period: "2025" },
];

export const mockNews: NewsArticle[] = [
  {
    id: "1",
    slug: "guinee-outils-modernes-pilotage-economie",
    title: "La Guinée se dote d'outils modernes pour mieux piloter son économie",
    category: "Conjoncture",
    excerpt:
      "La DNPEC renforce ses dispositifs de suivi conjoncturel pour mieux éclairer la décision publique.",
    date: "2026-06-16",
  },
  {
    id: "2",
    slug: "penurie-billets-liquidite-fiduciaire",
    title: "Comprendre la pénurie de billets et la liquidité fiduciaire",
    category: "Finances publiques",
    excerpt: "Éclairage sur les mécanismes de la liquidité fiduciaire et ses effets sur l'économie réelle.",
    date: "2026-06-16",
  },
  {
    id: "3",
    slug: "notation-souveraine-guinee-b-plus",
    title: "Notation souveraine : la Guinée passe à « B+, perspectives positives »",
    category: "International",
    excerpt: "Retour sur l'amélioration de la notation souveraine de la Guinée et ses implications.",
    date: "2026-03-16",
  },
];

export const mockPublications: Publication[] = [
  {
    id: "1",
    slug: "documents-conjoncturels",
    title: "Documents conjoncturels",
    description:
      "Tableaux de bord mensuels, notes hebdomadaires et rapports régionaux de conjoncture sur l'économie guinéenne.",
    type: "conjoncturels",
    year: 2026,
    href: "/publications/documents-conjoncturels",
  },
  {
    id: "2",
    slug: "documents-politique-economique",
    title: "Documents de politique économique",
    description:
      "Analyses, recommandations et orientations pour guider les décisions de politique économique du Gouvernement.",
    type: "politique-economique",
    year: 2026,
    href: "/documents-politique-economique",
  },
  {
    id: "3",
    slug: "documents-statistiques",
    title: "Documents statistiques",
    description:
      "Séries de données macroéconomiques, finances publiques, balance des paiements et situation monétaire.",
    type: "statistiques",
    year: 2026,
    href: "/documents-statistiques",
  },
];

/** Catégories de publications reprises du menu Publications (lib/nav-data.ts), pour les filtres. */
export const publicationTypes: { value: string; label: string }[] = [
  { value: "budgetaires", label: "Documents budgétaires" },
  { value: "conjoncturels", label: "Documents conjoncturels" },
  { value: "integration-regionale", label: "Documents de suivi de l'intégration économique régionale" },
  { value: "politique-economique", label: "Documents de politique économique" },
  { value: "analyses-etudes", label: "Documents d'analyse et d'études économiques" },
  { value: "travail", label: "Documents de travail" },
  { value: "statistiques", label: "Documents statistiques" },
];

export const mockPartners: Partner[] = [
  { id: "acgp", name: "ACGP", logoUrl: "/partners/acgp.jpg", websiteUrl: "https://acgp.gov.gn/" },
  { id: "dgpeip", name: "DGPEIP", logoUrl: "/partners/dgpeip.jpg", websiteUrl: "https://dgpeip.gov.gn/" },
  { id: "dncf", name: "DNCF", logoUrl: "/partners/dncf.jpg", websiteUrl: "https://www.mefb.gov.gn/" },
  { id: "dndapd", name: "DND-APD", logoUrl: "/partners/dndapd.jpg", websiteUrl: "https://dette.gov.gn/" },
  { id: "dnip", name: "DNIP", logoUrl: "/partners/dnip.jpg", websiteUrl: "https://dnip.mefp.gov.gn/" },
  { id: "armp", name: "ARMP Guinée", logoUrl: "/partners/armp.jpg", websiteUrl: "https://armpguinee.org/" },
  { id: "tresor", name: "DGTCP Trésor Public", logoUrl: "/partners/tresor.jpg", websiteUrl: "https://www.mefb.gov.gn/" },
  { id: "uppp", name: "UPPP", logoUrl: "/partners/uppp.jpg", websiteUrl: "https://www.mefb.gov.gn/" },
  { id: "dgcmp", name: "DGCCMP", logoUrl: "/partners/dgcmp.jpg", websiteUrl: "https://dgcmp.gov.gn/" },
  { id: "ins", name: "INS Guinée", logoUrl: "/partners/ins.png", websiteUrl: "https://www.stat-guinee.org/" },
  { id: "simandou", name: "Programme Simandou 2040", logoUrl: "/partners/simandou.png", websiteUrl: "https://simandou2040.gov.gn/" },
  { id: "guinee", name: "République de Guinée", logoUrl: "/partners/branding.png", websiteUrl: "https://gouvernement.gov.gn/" },
];

/**
 * Cartes pour le Hero / carrousel d'accueil — utilisées quand aucune page
 * publication n'est encore publiée côté WordPress (getRecentPublicationCards).
 */
export const mockPublicationCards: PublicationCard[] = [
  {
    slug: "tableau-de-bord-mensuel-de-leconomie-guineenne-tbmeg",
    href: "/tbmeg",
    title: "Tableau de Bord Mensuel de l'Économie Guinéenne (TBMEG)",
    date: "2026-08-01",
  },
  {
    slug: "note-conjoncture-economique-guinee",
    href: "/note-conjoncture-economique-guinee",
    title: "Note de conjoncture économique de la Guinée",
    date: "2026-07-15",
  },
  {
    slug: "rapport-regional-conjoncture",
    href: "/rapport-regional-conjoncture",
    title: "Rapport régional de conjoncture (RRC)",
    date: "2026-06-30",
  },
  {
    slug: "note-hebdomadaire-economie-guineenne",
    href: "/note-hebdomadaire-economie-guineenne",
    title: "Note hebdomadaire de l'économie guinéenne",
    date: "2026-06-20",
  },
  {
    slug: "autres-notes-techniques",
    href: "/autres-notes-techniques",
    title: "Autres notes techniques",
    date: "2026-06-10",
  },
];
