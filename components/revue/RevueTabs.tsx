"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PageEnConstruction from "@/components/ui/PageEnConstruction";
import type { InstitutionalPage } from "@/lib/types";
import type { RpaeArticle } from "@/lib/rpae";

const TABS = [
  { key: "presentation", label: "Présentation" },
  { key: "equipe", label: "Équipe Éditoriale" },
  { key: "instructions", label: "Instructions aux auteurs" },
  { key: "numeros", label: "Articles publiés" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

type RevueTabsProps = {
  presentation: InstitutionalPage | null;
  equipe: InstitutionalPage | null;
  instructions: InstitutionalPage | null;
  articles: RpaeArticle[];
};

function TabContent({ page, fallbackTitle }: { page: InstitutionalPage | null; fallbackTitle: string }) {
  if (!page) return <PageEnConstruction title={fallbackTitle} />;
  return (
    <div className="article-content text-[15px] text-ink leading-relaxed" dangerouslySetInnerHTML={{ __html: page.content }} />
  );
}

function ArticlesCatalog({ articles }: { articles: RpaeArticle[] }) {
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [profilFilter, setProfilFilter] = useState<string>("all");
  const [themeFilter, setThemeFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const years = useMemo(
    () => [...new Set(articles.map((a) => a.year))].sort((a, b) => b - a),
    [articles],
  );
  const profils = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of articles) map.set(a.profil, a.profilLabel);
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "fr"));
  }, [articles]);
  const themes = useMemo(
    () => [...new Set(articles.map((a) => a.theme))].sort((a, b) => a.localeCompare(b, "fr")),
    [articles],
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
      const list = groups.get(article.year) ?? [];
      list.push(article);
      groups.set(article.year, list);
    }
    return [...groups.entries()]
      .sort(([a], [b]) => b - a)
      .map(([year, items]) => ({
        year,
        articles: items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      }));
  }, [filtered]);

  if (articles.length === 0) {
    return <p className="text-muted text-sm">Aucun article publié pour le moment.</p>;
  }

  const selectClass =
    "h-10 rounded-lg border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:border-navy";

  return (
    <div>
      <div className="flex flex-col gap-3 mb-6">
        <label className="sr-only" htmlFor="rpae-search">
          Rechercher un article
        </label>
        <input
          id="rpae-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par titre, auteur, thème…"
          className="h-11 w-full rounded-lg border border-line bg-white px-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-navy"
        />
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Filtrer par année"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all">Toutes les années</option>
            {years.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrer par profil"
            value={profilFilter}
            onChange={(e) => setProfilFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all">Tous les profils</option>
            {profils.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrer par thème"
            value={themeFilter}
            onChange={(e) => setThemeFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all">Tous les thèmes</option>
            {themes.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
        </div>
      </div>

      {byYear.length === 0 ? (
        <p className="text-muted text-sm">Aucun article ne correspond à ces critères.</p>
      ) : (
        <div className="flex flex-col gap-10">
          {byYear.map((group) => (
            <div key={group.year}>
              <h3 className="text-navy font-bold text-lg mb-4 border-b border-line pb-2">{group.year}</h3>
              <ul className="flex flex-col gap-4">
                {group.articles.map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/revue-scientifique/${article.slug}`}
                      className="block group -mx-2 px-2 py-3 rounded-lg hover:bg-navy/[0.03] transition-colors"
                    >
                      <p className="text-navy font-semibold text-[15px] group-hover:underline leading-snug">
                        {article.title}
                      </p>
                      <p className="text-sm text-muted mt-1.5">
                        {article.auteur}
                        {article.gradeAuteur ? ` · ${article.gradeAuteur}` : ""}
                        {" · "}
                        {article.profilLabel}
                        {" · "}
                        {article.theme}
                      </p>
                      {article.resume ? (
                        <p className="text-sm text-ink/80 mt-2 leading-relaxed line-clamp-2">{article.resume}</p>
                      ) : null}
                    </Link>
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
  const [active, setActive] = useState<TabKey>("presentation");

  return (
    <div>
      <div role="tablist" className="flex flex-wrap gap-1 border-b border-line mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active === tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${
              active === tab.key
                ? "border-yellow text-navy"
                : "border-transparent text-muted hover:text-navy hover:border-line"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "presentation" && <TabContent page={presentation} fallbackTitle="Présentation" />}
      {active === "equipe" && <TabContent page={equipe} fallbackTitle="Équipe Éditoriale" />}
      {active === "instructions" && (
        <>
          <TabContent page={instructions} fallbackTitle="Instructions aux auteurs" />
          <Link
            href="/revue-scientifique/soumettre"
            className="inline-flex items-center justify-center bg-yellow text-navy-dark font-bold text-sm px-6 h-11 rounded-lg hover:brightness-95 transition-[filter] mt-6"
          >
            Soumettre un article
          </Link>
        </>
      )}
      {active === "numeros" && <ArticlesCatalog articles={articles} />}
    </div>
  );
}
