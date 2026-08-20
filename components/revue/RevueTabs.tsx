"use client";

import { useEffect, useMemo, useState } from "react";
import LocalizedLink from "@/components/i18n/LocalizedLink";
import type { InstitutionalPage } from "@/lib/types";
import type { RpaeArticle } from "@/lib/rpae";
import { useLocale, useMessages } from "@/lib/i18n/use-locale";

type TabKey = "presentation" | "equipe" | "instructions" | "numeros";

type RevueTabsProps = {
  presentation: InstitutionalPage | null;
  equipe: InstitutionalPage | null;
  instructions: InstitutionalPage | null;
  articles: RpaeArticle[];
};

/** Années uniques, numériques, triées décroissant. */
function uniqueYears(articles: RpaeArticle[]): number[] {
  const set = new Set<number>();
  for (const article of articles) {
    const year = Number(article.year);
    if (Number.isFinite(year) && year > 1900 && year < 2100) set.add(year);
  }
  return [...set].sort((a, b) => b - a);
}

/** Retire un éventuel h1/h2 en tête du HTML WP (évite double titre / débordement). */
function stripLeadingHeading(html: string): string {
  return html.replace(/^\s*<(h1|h2)(\s[^>]*)?>[\s\S]*?<\/\1>\s*/i, "").trim();
}

function TabContent({ page, fallbackTitle }: { page: InstitutionalPage | null; fallbackTitle: string }) {
  const t = useMessages();
  if (!page) {
    return (
      <div className="py-10 text-center">
        <h2 className="text-navy text-xl font-heading font-semibold mb-3">{fallbackTitle}</h2>
        <p className="text-muted text-sm">{t.common.underConstruction}</p>
      </div>
    );
  }
  return (
    <div
      className="article-content min-w-0 overflow-x-auto text-[15px] text-ink leading-relaxed"
      dangerouslySetInnerHTML={{ __html: page.content }}
    />
  );
}

function PresentationPanel({
  presentation,
  articles,
  onSelectYear,
}: {
  presentation: InstitutionalPage | null;
  articles: RpaeArticle[];
  onSelectYear: (year: number) => void;
}) {
  const t = useMessages();
  const years = useMemo(() => {
    const fromArticles = uniqueYears(articles);
    if (fromArticles.length > 0) return fromArticles;
    const current = new Date().getFullYear();
    return [current, current - 1, current - 2];
  }, [articles]);

  const rawTitle = presentation?.title?.trim() || "";
  const title =
    rawTitle && !/^rpae/i.test(rawTitle) && rawTitle.length > 8 ? rawTitle : t.revueUi.defaultTitle;

  const bodyHtml = useMemo(() => {
    const raw = presentation?.content ?? "";
    const plain = raw.replace(/<[^>]*>/g, "").trim();
    if (!plain) return t.revueUi.defaultHtml;
    return stripLeadingHeading(raw) || t.revueUi.defaultHtml;
  }, [presentation?.content, t.revueUi.defaultHtml]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(200px,240px)] gap-8 lg:gap-12 items-start w-full min-w-0">
      <div className="min-w-0 max-w-prose lg:max-w-none">
        <h2 className="text-navy font-bold text-[1.5rem] sm:text-[1.75rem] leading-snug mb-5 break-words">
          {title}
        </h2>
        <div
          className="article-content text-[15px] text-ink leading-[1.8] break-words [&_p]:mb-4 [&_p:last-child]:mb-0 [&_img]:max-w-full"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </div>

      <aside className="min-w-0 w-full lg:sticky lg:top-24">
        <h3 className="text-navy font-bold text-lg sm:text-xl mb-2">{t.revueUi.sommaire}</h3>
        <nav aria-label={t.revueUi.sommaireEditions}>
          <ul className="border-t border-line">
            {years.map((year) => (
              <li key={`edition-${year}`} className="border-b border-line">
                <button
                  type="button"
                  onClick={() => onSelectYear(year)}
                  className="w-full text-left py-3 pr-2 text-navy font-bold text-[14px] sm:text-[15px] hover:bg-navy/[0.04] transition-colors cursor-pointer"
                >
                  {t.revueUi.edition.replace("{year}", String(year))}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}

function ArticlesCatalog({
  articles,
  initialYear,
}: {
  articles: RpaeArticle[];
  initialYear?: string;
}) {
  const t = useMessages();
  const locale = useLocale();
  const [yearFilter, setYearFilter] = useState<string>(initialYear ?? "all");
  const [profilFilter, setProfilFilter] = useState<string>("all");
  const [themeFilter, setThemeFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (initialYear) setYearFilter(initialYear);
  }, [initialYear]);

  const years = useMemo(() => uniqueYears(articles), [articles]);
  const profils = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of articles) {
      const label = t.rpae.profils[a.profil as keyof typeof t.rpae.profils] ?? a.profilLabel;
      map.set(a.profil, label);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], locale === "en" ? "en" : "fr"));
  }, [articles, locale, t.rpae.profils]);
  const themes = useMemo(
    () =>
      [...new Set(articles.map((a) => a.theme))].sort((a, b) =>
        a.localeCompare(b, locale === "en" ? "en" : "fr"),
      ),
    [articles, locale],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      if (yearFilter !== "all" && String(a.year) !== yearFilter) return false;
      if (profilFilter !== "all" && a.profil !== profilFilter) return false;
      if (themeFilter !== "all" && a.theme !== themeFilter) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.auteur.toLowerCase().includes(q) ||
        a.theme.toLowerCase().includes(q) ||
        a.resume.toLowerCase().includes(q)
      );
    });
  }, [articles, yearFilter, profilFilter, themeFilter, query]);

  const byYear = useMemo(() => {
    const groups = new Map<number, RpaeArticle[]>();
    for (const article of filtered) {
      const year = Number(article.year);
      const list = groups.get(year) ?? [];
      list.push(article);
      groups.set(year, list);
    }
    return [...groups.entries()]
      .sort(([a], [b]) => b - a)
      .map(([year, items]) => ({
        year,
        articles: items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      }));
  }, [filtered]);

  if (articles.length === 0) {
    return <p className="text-muted text-sm">{t.revueUi.noArticles}</p>;
  }

  const selectClass =
    "h-10 rounded-lg border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:border-navy";

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-3 mb-6">
        <label className="sr-only" htmlFor="rpae-search">
          {t.revueUi.searchArticle}
        </label>
        <input
          id="rpae-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.revueUi.searchPlaceholder}
          className="h-11 w-full rounded-lg border border-line bg-white px-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-navy"
        />
        <div className="flex flex-wrap gap-2">
          <select
            aria-label={t.revueUi.filterYear}
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all">{t.revueUi.allYears}</option>
            {years.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
          <select
            aria-label={t.revueUi.filterProfil}
            value={profilFilter}
            onChange={(e) => setProfilFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all">{t.revueUi.allProfiles}</option>
            {profils.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            aria-label={t.revueUi.filterTheme}
            value={themeFilter}
            onChange={(e) => setThemeFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all">{t.revueUi.allThemes}</option>
            {themes.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
        </div>
      </div>

      {byYear.length === 0 ? (
        <p className="text-muted text-sm">{t.revueUi.noMatch}</p>
      ) : (
        <div className="flex flex-col gap-10">
          {byYear.map((group) => (
            <div key={group.year} id={`edition-${group.year}`}>
              <h3 className="text-navy font-bold text-lg mb-4 border-b border-line pb-2">
                {t.revueUi.edition.replace("{year}", String(group.year))}
              </h3>
              <ul className="flex flex-col gap-4">
                {group.articles.map((article) => (
                  <li key={article.id}>
                    <LocalizedLink
                      href={`/revue-scientifique/${article.slug}`}
                      className="block group -mx-2 px-2 py-3 rounded-lg hover:bg-navy/[0.03] transition-colors"
                    >
                      <p className="text-navy font-semibold text-[15px] group-hover:underline leading-snug break-words">
                        {article.title}
                      </p>
                      <p className="text-sm text-muted mt-1.5">
                        {article.auteur}
                        {article.gradeAuteur ? ` · ${article.gradeAuteur}` : ""}
                        {" · "}
                        {t.rpae.profils[article.profil as keyof typeof t.rpae.profils] ?? article.profilLabel}
                        {" · "}
                        {article.theme}
                      </p>
                      {article.resume ? (
                        <p className="text-sm text-ink/80 mt-2 leading-relaxed line-clamp-2">{article.resume}</p>
                      ) : null}
                    </LocalizedLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RevueTabs({ presentation, equipe, instructions, articles }: RevueTabsProps) {
  const t = useMessages();
  const [active, setActive] = useState<TabKey>("presentation");
  const [catalogYear, setCatalogYear] = useState<string | undefined>(undefined);

  const tabs = [
    { key: "presentation" as const, label: t.revueUi.tabPresentation },
    { key: "equipe" as const, label: t.revueUi.tabEquipe },
    { key: "instructions" as const, label: t.revueUi.tabInstructions },
    { key: "numeros" as const, label: t.revueUi.tabArticles },
  ];

  function openEdition(year: number) {
    setCatalogYear(String(year));
    setActive("numeros");
  }

  return (
    <div className="min-w-0 w-full">
      <div role="tablist" className="flex flex-wrap gap-1 mb-8 border-b border-line pb-0">
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                if (tab.key !== "numeros") setCatalogYear(undefined);
                setActive(tab.key);
              }}
              className={`px-3.5 sm:px-4 py-2.5 text-[13px] sm:text-sm font-semibold rounded-t-md transition-colors cursor-pointer ${
                isActive
                  ? "bg-navy text-white"
                  : "bg-transparent text-navy/70 hover:text-navy hover:bg-navy/[0.06]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="min-w-0">
        {active === "presentation" && (
          <PresentationPanel presentation={presentation} articles={articles} onSelectYear={openEdition} />
        )}
        {active === "equipe" && <TabContent page={equipe} fallbackTitle={t.revueUi.tabEquipe} />}
        {active === "instructions" && (
          <>
            <TabContent page={instructions} fallbackTitle={t.revueUi.tabInstructions} />
            <LocalizedLink
              href="/revue-scientifique/soumettre"
              className="inline-flex items-center justify-center bg-yellow text-navy-dark font-bold text-sm px-6 h-11 rounded-lg hover:brightness-95 transition-[filter] mt-6"
            >
              {t.common.submitArticle}
            </LocalizedLink>
          </>
        )}
        {active === "numeros" && <ArticlesCatalog articles={articles} initialYear={catalogYear} />}
      </div>
    </div>
  );
}
