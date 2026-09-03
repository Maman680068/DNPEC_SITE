export type OrgNode = {
  code: string;
  /** Sigle/périmètre proposé, non encore validé par le Directeur National. */
  provisional?: boolean;
};

export type OrgDivision = OrgNode & {
  sections: OrgNode[];
};

/**
 * Structure de l'organigramme de la DNPEC. Une entrée marquée
 * `provisional: true` est une proposition en attente de validation par le
 * Directeur National (affichée avec un astérisque et une bordure pointillée
 * par NodeBox) — modifier uniquement ici si les sigles changent, pas
 * ailleurs dans le code (voir OrgChartDesktop / OrgChartMobile qui lisent
 * ces données).
 */
export const ORG_CHART = {
  dn: "DN",
  dna: "DNA",
  divisions: [
    {
      code: "DPE",
      sections: [{ code: "SSR" }, { code: "SFP" }, { code: "SSME" }, { code: "SGOP" }],
    },
    {
      code: "DEE",
      sections: [{ code: "SE" }, { code: "SDP" }, { code: "SME" }],
    },
    {
      code: "DSPS",
      sections: [{ code: "SSSP" }, { code: "SSSS" }, { code: "SSST" }, { code: "SSSQ" }],
    },
    {
      code: "DAC",
      sections: [{ code: "SCI" }, { code: "SCN" }, { code: "SEC" }, { code: "SGBD" }],
    },
    {
      code: "DIPE",
      sections: [{ code: "SIRC" }, { code: "SPEN" }, { code: "SAEVS" }],
    },
  ] as OrgDivision[],
  dnAttachments: ["CTSCM", "CNC"],
  dnaAttachments: ["SAF", "RH", "CSID"],
  bottomBand: "CHARGÉS D'ÉTUDES (C.E.)",
};

export const ORG_LEGEND: { code: string; label: string }[] = [
  { code: "DN", label: "Directeur National" },
  { code: "DNA", label: "Directeur National Adjoint" },
  { code: "DPE", label: "Division des Prévisions Économiques" },
  { code: "DEE", label: "Division Études Économiques" },
  { code: "DSPS", label: "Division Suivi de Politiques Économiques" },
  { code: "DAC", label: "Division Analyses Conjoncturelles" },
  { code: "DIPE", label: "Division Intégration et Partenariats Économiques" },
  { code: "SSR", label: "Section Secteur Réel" },
  { code: "SFP", label: "Section Finances Publiques" },
  { code: "SSME", label: "Section Secteurs Monétaires et Extérieur" },
  { code: "SGOP", label: "Section Gestion des Outils de Prévision" },
  { code: "SE", label: "Section Études" },
  { code: "SDP", label: "Section Documentation et Publications" },
  { code: "SME", label: "Section Modélisation Économique" },
  { code: "SSSP", label: "Section Suivi du Secteur Primaire" },
  { code: "SSSS", label: "Section Suivi du Secteur Secondaire" },
  { code: "SSST", label: "Section Suivi du Secteur Tertiaire" },
  { code: "SSSQ", label: "Section Suivi du Secteur Quaternaire" },
  { code: "SCI", label: "Section Conjoncture Internationale" },
  { code: "SCN", label: "Section Conjoncture Nationale" },
  { code: "SEC", label: "Section Enquête Conjoncturelle" },
  { code: "SGBD", label: "Section Gestion de la Base des Données" },
  { code: "SAF", label: "Service Administratif et Financier" },
  { code: "RH", label: "Ressource humaine" },
  { code: "CSID", label: "Cellule des Systèmes d'Informations et de la Digitalisation" },
  { code: "CTSCM", label: "Cellule Technique de Suivi de la Conjoncture Macroéconomique" },
  { code: "CNC", label: "Comité National de Coordination des Politiques Macroéconomiques et Monétaires" },
  { code: "SIRC", label: "Section Intégration Régionale et Convergence" },
  { code: "SPEN", label: "Section Partenariats Économiques et Négociations" },
  { code: "SAEVS", label: "Section Analyse, Études et Veille Stratégique" },
];
