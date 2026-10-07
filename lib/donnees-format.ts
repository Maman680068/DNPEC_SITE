import { dateLocale, type Locale } from "./i18n/config";

/**
 * Mise en forme des chiffres de data/donnees.json (sans dépendance serveur,
 * utilisable dans les composants client).
 */

const MINUS = "−";
const NBSP = " ";

/** Unités stockées en fraction dans le classeur (0,071 = 7,1 %). */
export function isPercentUnit(unite: string): boolean {
  return unite.trim().startsWith("%");
}

/** Nombre de décimales affichées selon l'unité. */
export function unitDecimals(unite: string): number {
  if (isPercentUnit(unite)) return 1;
  if (unite.startsWith("mois")) return 1;
  return 0;
}

/** Valeur dans l'unité d'affichage (pourcentages × 100). */
export function displayValue(valeur: number, unite: string): number {
  return isPercentUnit(unite) ? valeur * 100 : valeur;
}

/**
 * Formate un nombre selon la langue, avec un vrai signe moins (−) et sans
 * « −0,0 » quand l'arrondi ramène la valeur à zéro.
 */
export function formatNumber(value: number, decimals: number, locale: Locale): string {
  const formatted = Math.abs(value).toLocaleString(dateLocale(locale), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const roundsToZero = Number(Math.abs(value).toFixed(decimals)) === 0;
  return value < 0 && !roundsToZero ? `${MINUS}${formatted}` : formatted;
}

/** Valeur brute du classeur → texte affiché dans les tableaux (sans unité). */
export function formatSeriesValue(valeur: number, unite: string, locale: Locale): string {
  return formatNumber(displayValue(valeur, unite), unitDecimals(unite), locale);
}

/** Valeur d'un indicateur clé avec son unité : « 7,1 % » (fr), « 7.1% » (en). */
export function formatIndicatorValue(valeur: number, unite: string, locale: Locale): string {
  const number = formatSeriesValue(valeur, unite, locale);
  if (unite === "%") return locale === "en" ? `${number}%` : `${number}${NBSP}%`;
  return `${number}${NBSP}${unite}`;
}

/** « 2024-2025 » ou « 2025 » à partir des années en estimation (supposées consécutives). */
export function yearRangeLabel(years: number[]): string {
  if (years.length === 0) return "";
  const sorted = [...years].sort((a, b) => a - b);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  return first === last ? String(first) : `${first}-${last}`;
}

/** Date ISO (2026-06-13) → « 13 juin 2026 » / « 13 June 2026 ». */
export function formatDataDate(iso: string, locale: Locale): string {
  const date = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(dateLocale(locale), { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
