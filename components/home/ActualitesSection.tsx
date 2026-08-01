import Link from "next/link";
import type { NewsArticle } from "@/lib/types";
import SectionHead from "@/components/ui/SectionHead";

function formatDate(dateIso: string) {
  return new Date(dateIso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type ActualitesSectionProps = {
  articles: NewsArticle[];
};

export default function ActualitesSection({ articles }: ActualitesSectionProps) {
  return (
    <section className="pb-14">
      <SectionHead title="Nos actualités" seeAllHref="/actualites" seeAllLabel="TOUTES LES ACTUALITÉS" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[22px]">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/actualites/${article.slug}`}
            className="news-card group rounded-[10px] overflow-hidden relative h-[300px] block shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            {article.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.coverImage}
                alt={article.title}
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
              />
            )}
            <span className="absolute top-3.5 left-3.5 bg-green text-white text-[10.5px] font-bold px-2.5 py-1 rounded uppercase tracking-wide">
              {article.category}
            </span>
            <div className="news-overlay absolute left-0 right-0 bottom-0 px-4.5 pt-[60px] pb-4.5">
              <h3 className="text-white text-[15.5px] leading-snug mb-3 font-semibold">
                {article.title}
              </h3>
              <div className="flex items-center justify-between">
                <span className="bg-yellow text-navy-dark text-xs font-bold px-3.5 py-1.5 rounded-md">
                  Lire l&apos;article
                </span>
                <span className="text-[11px] text-[#c3cee0]">{formatDate(article.date)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
