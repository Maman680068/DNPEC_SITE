"use client";

import { useState } from "react";
import PageEnConstruction from "@/components/ui/PageEnConstruction";
import type { InstitutionalPage } from "@/lib/types";

export type ArticleYearGroup = {
  year: number;
  articles: { title: string; href: string }[];
};

const TABS = [
  { key: "presentation", label: "Présentation" },
  { key: "equipe", label: "Équipe Éditoriale" },
  { key: "instructions", label: "Instructions aux auteurs" },
  { key: "numeros", label: "Numéro par année" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

type RevueTabsProps = {
  presentation: InstitutionalPage | null;
  equipe: InstitutionalPage | null;
  instructions: InstitutionalPage | null;
  articlesByYear: ArticleYearGroup[];
};

function TabContent({ page, fallbackTitle }: { page: InstitutionalPage | null; fallbackTitle: string }) {
  if (!page) return <PageEnConstruction title={fallbackTitle} />;
  return (
    <div className="article-content text-[15px] text-ink leading-relaxed" dangerouslySetInnerHTML={{ __html: page.content }} />
  );
}

export default function RevueTabs({ presentation, equipe, instructions, articlesByYear }: RevueTabsProps) {
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
      {active === "instructions" && <TabContent page={instructions} fallbackTitle="Instructions aux auteurs" />}
      {active === "numeros" &&
        (articlesByYear.length === 0 ? (
          <p className="text-muted text-sm">Aucun article publié pour le moment.</p>
        ) : (
          <div className="flex flex-col gap-8">
            {articlesByYear.map((group) => (
              <div key={group.year}>
                <h3 className="text-navy font-bold text-lg mb-3">{group.year}</h3>
                <ul className="flex flex-col gap-2">
                  {group.articles.map((article) => (
                    <li key={article.href}>
                      <a href={article.href} className="text-navy hover:underline text-[15px]">
                        {article.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
