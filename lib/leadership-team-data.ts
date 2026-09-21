export type LeadershipMember = {
  id: string;
  name: string | null;
  /** Sigle d'unité (DPE, SAF, RH, CSID, …). */
  unitCode?: string;
  photo?: string;
  /** Page biographie dédiée (ex. Mot du Directeur National). */
  biographyHref?: string;
  biography?: Partial<Record<"fr" | "en", string>>;
};

export type LeadershipRole = "dn" | "dna";

export const LEADERSHIP_DIRECTION: Array<LeadershipMember & { role: LeadershipRole }> = [
  {
    id: "dn",
    role: "dn",
    name: "Abdoulaye Ibrahima Diallo",
    photo: "/leadership/dn.png",
    biographyHref: "/la-dnpec/mot-du-directeur",
  },
  {
    id: "dna",
    role: "dna",
    name: "Mohamed Fadiga",
    photo: "/leadership/dna.jpg",
  },
];

/** Ordre d'affichage : DPE, DIPE, puis les autres divisions. */
export const LEADERSHIP_DIVISION_CHIEFS: LeadershipMember[] = [
  {
    id: "dpe",
    unitCode: "DPE",
    name: "Alioune Diallo",
    photo: "/leadership/dpe.jpg",
  },
  {
    id: "dipe",
    unitCode: "DIPE",
    name: "Abdoulaye Mamadama Camara",
    photo: "/leadership/dipe.png",
  },
  {
    id: "dsps",
    unitCode: "DSPS",
    name: "Ibrahima Kalil Condé",
    photo: "/leadership/dsps.jpg",
  },
  {
    id: "dac",
    unitCode: "DAC",
    name: "Morikè Keita",
    photo: "/leadership/dac.webp",
  },
  {
    id: "dee",
    unitCode: "DEE",
    name: "Nouhan Traoré",
    photo: "/leadership/dee.webp",
  },
];

/** Services rattachés au DNA (organigramme). */
export const LEADERSHIP_SERVICE_CHIEFS: LeadershipMember[] = [
  {
    id: "saf",
    unitCode: "SAF",
    name: "Toumany Kaba",
    photo: "/leadership/saf.webp",
  },
  { id: "rh", unitCode: "RH", name: "Balla Oularé" },
  { id: "csid", unitCode: "CSID", name: null },
];
