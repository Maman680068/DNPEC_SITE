import DonneesChart, { type ChartSeries } from "@/components/donnees/DonneesChart";
import TableScroller from "@/components/donnees/TableScroller";
import type { Locale } from "@/lib/i18n/config";
import { localizeHref } from "@/lib/i18n/href";
import { messages } from "@/lib/i18n/messages";
import {
  estimatedYears,
  isSubSeries,
  rubriqueTitle,
  serieLabel,
  sourceText,
  unitLabel,
  type Donnees,
  type DonneesRubrique,
} from "@/lib/donnees";
import { displayValue, formatDataDate, formatSeriesValue, unitDecimals, yearRangeLabel } from "@/lib/donnees-format";

/** Graphique principal de chaque rubrique : séries tracées (même unité). */
const CHARTS: Record<string, { type: "bar" | "line"; series: string[] }> = {
  "secteur-reel": { type: "bar", series: ["pib_croissance"] },
  "prix-monnaie": { type: "line", series: ["inflation_fin", "inflation_moy"] },
  "finances-publiques": { type: "bar", series: ["solde_dons_inclus", "solde_dons_exclus"] },
  "balance-paiements": { type: "bar", series: ["exportations", "importations"] },
  dette: { type: "bar", series: ["dette_ext_pib"] },
};

type DonneesSectionProps = {
  data: Donnees;
  rubrique: DonneesRubrique;
  locale: Locale;
};

export default function DonneesSection({ data, rubrique, locale }: DonneesSectionProps) {
  const t = messages[locale].donnees;
  const title = rubriqueTitle(rubrique.cle, locale);
  const estimated = new Set(estimatedYears(data));
  const years = data.annees.map((a) => ({ annee: a.annee, estimate: estimated.has(a.annee) }));
  const colon = locale === "en" ? ":" : " :";

  const chartConfig = CHARTS[rubrique.cle];
  const chartSeries = chartConfig
    ? chartConfig.series
        .map((cle) => rubrique.series.find((s) => s.cle === cle))
        .filter((s): s is NonNullable<typeof s> => Boolean(s))
    : [];
  const chartUnit = chartSeries[0]?.unite;
  const chart =
    chartConfig && chartUnit && chartSeries.every((s) => s.unite === chartUnit)
      ? {
          type: chartConfig.type,
          unit: unitLabel(chartUnit, locale),
          decimals: unitDecimals(chartUnit),
          series: chartSeries.map<ChartSeries>((s) => ({
            key: s.cle,
            label: serieLabel(s, locale),
            values: years.map(({ annee }) => {
              const point = s.valeurs.find((v) => v.annee === annee);
              return point ? displayValue(point.valeur, s.unite) : null;
            }),
          })),
        }
      : null;

  const estimatedList = [...estimated];
  const source = sourceText(data, locale);
  const dataDate = formatDataDate(data.date, locale);
  // Pas de « Données au … » quand la source contient déjà la date du cadrage.
  const showDate = !source.includes(dataDate);

  return (
    <section id={rubrique.cle} className="scroll-mt-20 bg-white rounded-2xl shadow-[0_10px_28px_rgba(13,32,71,0.08)] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="text-navy text-lg sm:text-xl font-heading font-semibold">{title}</h2>
        <a
          href={localizeHref(locale, `/donnees/csv/${rubrique.cle}`)}
          download
          aria-label={t.downloadLabel(title)}
          className="inline-flex items-center gap-2 rounded-full border border-green px-4 py-2 text-sm font-semibold text-green hover:bg-green hover:text-white transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" aria-hidden="true">
            <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t.download}
        </a>
      </div>

      {chart ? (
        <div className="mb-6">
          <DonneesChart
            title={t.chartTitles[rubrique.cle] ?? title}
            unit={chart.unit}
            type={chart.type}
            locale={locale}
            decimals={chart.decimals}
            years={years}
            series={chart.series}
            labels={{ estimate: t.legendEstimate, estimateShort: t.estimateShort }}
          />
        </div>
      ) : null}

      <TableScroller hint={t.scrollHint}>
        <table className="w-full min-w-[620px] border-collapse text-[13px] sm:text-sm">
          <caption className="sr-only">{t.tableCaption(title)}</caption>
          <thead>
            <tr className="border-b-2 border-navy/15">
              <th
                scope="col"
                className="sticky left-0 z-[1] bg-white text-left font-semibold text-navy py-2 pr-3 shadow-[1px_0_0_var(--color-line)]"
              >
                {t.series}
              </th>
              <th scope="col" className="text-left font-semibold text-navy py-2 px-3 whitespace-nowrap">
                {t.unit}
              </th>
              {years.map((yr) => (
                <th
                  key={yr.annee}
                  scope="col"
                  className={`text-right font-semibold text-navy py-2 px-3 whitespace-nowrap ${yr.estimate ? "bg-yellow/15" : ""}`}
                >
                  {yr.annee}
                  {yr.estimate ? (
                    <span className="block text-[11px] font-normal italic text-muted">{t.estimate}</span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rubrique.series.map((serie) => {
              const sub = isSubSeries(serie);
              return (
                <tr key={serie.cle} className="border-b border-line">
                  <th
                    scope="row"
                    className={`sticky left-0 z-[1] bg-white text-left font-normal py-2 pr-3 min-w-[160px] sm:min-w-[200px] shadow-[1px_0_0_var(--color-line)] ${
                      sub ? "pl-4 italic text-muted" : "text-ink"
                    }`}
                  >
                    {serieLabel(serie, locale)}
                  </th>
                  <td className="py-2 px-3 text-muted whitespace-nowrap">{unitLabel(serie.unite, locale)}</td>
                  {years.map((yr) => {
                    const point = serie.valeurs.find((v) => v.annee === yr.annee);
                    return (
                      <td
                        key={yr.annee}
                        className={`py-2 px-3 text-right whitespace-nowrap tabular-nums ${yr.estimate ? "bg-yellow/10 italic" : ""} ${
                          sub ? "text-muted" : "text-ink"
                        }`}
                      >
                        {point ? formatSeriesValue(point.valeur, serie.unite, locale) : t.notAvailable}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableScroller>

      <p className="mt-4 text-[12px] sm:text-[13px] text-muted">
        {estimatedList.length > 0 ? `${t.estimatesNote(yearRangeLabel(estimatedList), estimatedList.length > 1)} ` : ""}
        {t.sourceLabel}
        {colon} {source}.{showDate ? ` ${t.dataDate} ${dataDate}.` : ""}
      </p>
    </section>
  );
}
