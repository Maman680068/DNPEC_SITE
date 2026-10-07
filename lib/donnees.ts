import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { Locale } from "./i18n/config";
import { messages } from "./i18n/messages";
import { yearRangeLabel } from "./donnees-format";

/**
 * Données macroéconomiques publiées (data/donnees.json), générées depuis le
 * classeur de cadrage par scripts/import-donnees.mjs. Seules les années
 * publiées (jusqu'à derniereAnnee) y figurent.
 */

export type StatutAnnee = "Réalisé" | "Estimation";

export type DonneesIndicateur = {
  cle: string;
  libelle: string;
  /** Valeur brute du classeur : les pourcentages sont en fraction (0,071 = 7,1 %). */
  valeur: number;
  unite: string;
  annee: number;
  statut: StatutAnnee;
};

export type DonneesValeur = { annee: number; valeur: number; statut: StatutAnnee };

export type DonneesSerie = {
  cle: string;
  libelle: string;
  unite: string;
  valeurs: DonneesValeur[];
};

export type DonneesRubrique = { cle: string; series: DonneesSerie[] };

export type Donnees = {
  source: string;
  /** Date du cadrage, au format ISO (AAAA-MM-JJ). */
  date: string;
  premiereAnnee: number;
  derniereAnnee: number;
  annees: { annee: number; statut: StatutAnnee }[];
  indicateurs: DonneesIndicateur[];
  rubriques: DonneesRubrique[];
};

const DONNEES_PATH = path.join(process.cwd(), "data", "donnees.json");

/** Contenu de data/donnees.json, ou null si le fichier manque ou est illisible. */
export const getDonnees = cache(async (): Promise<Donnees | null> => {
  try {
    const raw = await readFile(DONNEES_PATH, "utf8");
    const data = JSON.parse(raw) as Donnees;
    if (!Array.isArray(data.indicateurs) || !Array.isArray(data.rubriques)) return null;
    return data;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn("[donnees] data/donnees.json illisible, repli sur les données par défaut", error);
    }
    return null;
  }
});

/** Années publiées en estimation (ex. [2024, 2025]). */
export function estimatedYears(data: Donnees): number[] {
  return data.annees.filter((a) => a.statut === "Estimation").map((a) => a.annee);
}

/** « Source : <source>. Années 2024-2025 : estimations. » (null si data/donnees.json manque). */
export async function getIndicatorsSourceNote(locale: Locale): Promise<string | null> {
  const data = await getDonnees();
  if (!data) return null;
  const t = messages[locale].donnees;
  const years = estimatedYears(data);
  const note = `${t.sourceLabel}${locale === "en" ? ":" : "\u00a0:"} ${data.source}.`;
  return years.length > 0 ? `${note} ${t.estimatesNote(yearRangeLabel(years), years.length > 1)}` : note;
}

/** Libellé d'une série dans la langue demandée (le classeur fait foi en français). */
export function serieLabel(serie: DonneesSerie, locale: Locale): string {
  return locale === "en" ? (messages.en.donnees.seriesLabels[serie.cle] ?? serie.libelle) : serie.libelle;
}

/** Unité dans la langue demandée. */
export function unitLabel(unite: string, locale: Locale): string {
  return locale === "en" ? (messages.en.donnees.units[unite] ?? unite) : unite;
}

/** Titre d'une rubrique (repris des sous-menus « Données »). */
export function rubriqueTitle(cle: string, locale: Locale): string {
  return messages[locale].nav[`/donnees#${cle}`] ?? cle;
}

/** Ligne « dont … » : sous-composante de la série précédente. */
export function isSubSeries(serie: DonneesSerie): boolean {
  return /^dont\s/i.test(serie.libelle);
}
