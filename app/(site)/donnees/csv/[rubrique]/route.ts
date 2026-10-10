import { estimatedYears, getDonnees, serieLabel, unitLabel } from "@/lib/donnees";
import { displayValue } from "@/lib/donnees-format";
import { isLocale, LOCALE_HEADER, type Locale } from "@/lib/i18n/config";
import { messages } from "@/lib/i18n/messages";

/**
 * Export CSV d'une rubrique de la page Données (/donnees/csv/<rubrique>,
 * /en/donnees/csv/<rubrique> en anglais). Valeurs dans l'unité affichée
 * (pourcentages × 100), 2 décimales. En français : séparateur « ; » et
 * virgule décimale, pour une ouverture directe dans Excel.
 */
export async function GET(request: Request, { params }: { params: Promise<{ rubrique: string }> }) {
  const { rubrique: cle } = await params;
  const data = await getDonnees();
  const rubrique = data?.rubriques.find((r) => r.cle === cle);
  if (!data || !rubrique) return new Response("Not found", { status: 404 });

  const headerLocale = request.headers.get(LOCALE_HEADER);
  const locale: Locale = isLocale(headerLocale) ? headerLocale : "fr";
  const t = messages[locale].donnees;
  const sep = locale === "en" ? "," : ";";
  const decimal = locale === "en" ? "." : ",";
  const estimated = new Set(estimatedYears(data));

  const cell = (value: string) =>
    value.includes(sep) || /["\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  const num = (value: number) => value.toFixed(2).replace(".", decimal);

  const header = [
    t.series,
    t.unit,
    ...data.annees.map((a) => (estimated.has(a.annee) ? `${a.annee} (${t.csvYearEstimate})` : String(a.annee))),
  ];
  const rows = rubrique.series.map((serie) => [
    serieLabel(serie, locale),
    unitLabel(serie.unite, locale),
    ...data.annees.map(({ annee }) => {
      const point = serie.valeurs.find((v) => v.annee === annee);
      return point ? num(displayValue(point.valeur, serie.unite)) : "";
    }),
  ]);
  const footer = [[], [t.sourceLabel, data.source], [t.csvDate, data.date]];

  const csv = [header, ...rows, ...footer].map((line) => line.map(cell).join(sep)).join("\r\n");
  const filename = `dnpec-donnees-${rubrique.cle}${locale === "en" ? "-en" : ""}.csv`;

  return new Response(`﻿${csv}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=300",
      Vary: LOCALE_HEADER,
    },
  });
}
