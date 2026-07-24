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
          { label: "Loi des finances", href: "/la-dnpec/textes-reglementaires#loi-des-finances" },
          { label: "Code des investissements", href: "/la-dnpec/textes-reglementaires#code-des-investissements" },
          { label: "Code général des impôts", href: "/la-dnpec/textes-reglementaires#code-general-des-impots" },
          { label: "Code des marchés publics", href: "/la-dnpec/textes-reglementaires#code-des-marches-publics" },
          { label: "Code minier", href: "/la-dnpec/textes-reglementaires#code-minier" },
        ],
      },
      { label: "Organigramme", href: "/la-dnpec/organigramme" },
    ],
  },
  {
    label: "Publications",
    href: "/publications",
    children: [
      {
        label: "Documents budgétaires",
        href: "/publications?type=budgetaires",
        children: [
          { label: "TBFP (Tableau de Bord Finances Publique)", href: "/publications?type=budgetaires" },
          { label: "TOFE (Tableau des Opérations Financières de l'État)", href: "/publications?type=budgetaires" },
        ],
      },
      {
        label: "Documents conjoncturels",
        href: "/publications?type=conjoncturels",
        children: [
          { label: "TBMEG", href: "/publications?type=conjoncturels" },
          { label: "Rapport régional de conjoncture (RRC)", href: "/publications?type=conjoncturels" },
          { label: "Note hebdomadaire de l'économie guinéenne", href: "/publications?type=conjoncturels" },
          { label: "Note de conjoncture économique de la Guinée", href: "/publications?type=conjoncturels" },
          { label: "Autres notes techniques", href: "/publications?type=conjoncturels" },
        ],
      },
      {
        label: "Documents de suivi de l'intégration économique régionale",
        href: "/publications?type=integration-regionale",
      },
      { label: "Documents de politique économique", href: "/publications?type=politique-economique" },
      {
        label: "Documents d'analyse et d'études économiques",
        href: "/publications?type=analyses-etudes",
        children: [
          { label: "Rapports", href: "/publications?type=analyses-etudes" },
          { label: "Rapport CPIA", href: "/publications?type=analyses-etudes" },
          { label: "Rapport économique et financier (REF)", href: "/publications?type=analyses-etudes" },
          { label: "Note trimestrielle d'analyse économique", href: "/publications?type=analyses-etudes" },
          { label: "Autres études", href: "/publications?type=analyses-etudes" },
        ],
      },
      { label: "Documents de travail", href: "/publications?type=travail" },
      { label: "Documents statistiques", href: "/publications?type=statistiques" },
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
      { label: "Soumission d'articles", href: "/revue-scientifique#soumission" },
    ],
  },
  {
    label: "Contact",
    href: "/contact",
    children: [
      { label: "Contactez-nous", href: "/contact" },
      { label: "Écrire au Directeur National", href: "/contact#directeur-national" },
    ],
  },
];
