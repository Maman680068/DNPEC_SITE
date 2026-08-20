export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Accueil", href: "/" },
  {
    label: "La DNPEC",
    href: "/la-dnpec",
    children: [
      { label: "Mot du Directeur National", href: "/la-dnpec/mot-du-directeur" },
      { label: "Historique", href: "/la-dnpec/historique" },
      { label: "Mission", href: "/la-dnpec/mission" },
      { label: "Cabinet", href: "/la-dnpec/cabinet" },
      {
        label: "Textes réglementaires",
        href: "/la-dnpec/textes-reglementaires",
        children: [
          { label: "Loi des finances", href: "/loi-des-finances" },
          { label: "Code des investissements", href: "/code-des-investissements" },
          { label: "Code général des impôts", href: "/code-general-des-impots" },
          { label: "Code des marchés publics", href: "/code-des-marches-publics" },
          { label: "Code minier", href: "/code-minier" },
        ],
      },
      { label: "Organigramme", href: "/organigramme" },
    ],
  },
  {
    label: "Publications",
    href: "/publications",
    children: [
      {
        label: "Documents prévisionnels",
        href: "/publications/documents-previsionnels",
        children: [
          { label: "Transition fiscale", href: "/transition-fiscale" },
          {
            label: "PEF (Perspectives économiques et financières)",
            href: "/perspectives-economiques-financieres",
          },
        ],
      },
      {
        label: "Documents budgétaires",
        href: "/publications/documents-budgetaires",
        children: [
          { label: "TBFP (Tableau de Bord Finances Publique)", href: "/tbfp" },
          { label: "TOFE (Tableau des Opérations Financières de l'État)", href: "/tofe" },
        ],
      },
      {
        label: "Documents conjoncturels",
        href: "/publications/documents-conjoncturels",
        children: [
          { label: "TBMEG", href: "/tbmeg" },
          { label: "Rapport régional de conjoncture (RRC)", href: "/rapport-regional-conjoncture" },
          { label: "Note hebdomadaire de l'économie guinéenne", href: "/note-hebdomadaire-economie-guineenne" },
          { label: "Note de conjoncture économique de la Guinée", href: "/note-conjoncture-economique-guinee" },
          { label: "Autres notes techniques", href: "/autres-notes-techniques" },
        ],
      },
      {
        label: "Documents de suivi de l'intégration économique régionale",
        href: "/documents-integration-regionale",
      },
      { label: "Documents de politique économique", href: "/documents-politique-economique" },
      {
        label: "Documents d'analyse et d'études économiques",
        href: "/publications/documents-analyses-etudes",
        children: [
          { label: "Rapports", href: "/rapports-analyses-etudes" },
          { label: "Rapport CPIA", href: "/rapport-cpia" },
          { label: "Rapport économique et financier (REF)", href: "/rapport-economique-financier" },
          { label: "Note trimestrielle d'analyse économique", href: "/note-trimestrielle-analyse-economique" },
          { label: "Autres études", href: "/autres-etudes-economiques" },
        ],
      },
      { label: "Documents de travail", href: "/documents-travail" },
      { label: "Documents statistiques", href: "/documents-statistiques" },
    ],
  },
  {
    label: "Données",
    href: "/donnees",
    children: [
      { label: "Secteur réel", href: "/donnees#secteur-reel" },
      { label: "Finances publiques (TOFE)", href: "/donnees#tofe" },
      { label: "Balance des paiements", href: "/donnees#balance-paiements" },
      { label: "Situation monétaire intégrée (SMI)", href: "/donnees#smi" },
    ],
  },
  { label: "Actualités", href: "/actualites" },
  { label: "Quelques chiffres", href: "/quelques-chiffres" },
  {
    label: "Conférences & Séminaires",
    href: "/conferences-seminaires",
    children: [
      { label: "Journées scientifiques", href: "/conferences-seminaires#journees-scientifiques" },
      { label: "Conférences périodiques", href: "/conferences-seminaires#conferences-periodiques" },
      { label: "Séminaires de recherche", href: "/conferences-seminaires#seminaires-recherche" },
    ],
  },
  {
    label: "Revue scientifique",
    href: "/revue-scientifique",
    children: [
      { label: "Revue scientifique", href: "/revue-scientifique" },
      { label: "Soumettre un article", href: "/revue-scientifique/soumettre" },
    ],
  },
  {
    label: "Contact",
    href: "/contact",
    children: [
      { label: "Contactez-nous", href: "/contact" },
      { label: "Écrire au Directeur National", href: "/ecrire-au-directeur-national" },
    ],
  },
];
