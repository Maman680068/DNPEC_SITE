import PageTitle from "@/components/ui/PageTitle";
import LocalizedLink from "@/components/i18n/LocalizedLink";
import { getNews } from "@/lib/wordpress";
import { getLocale, getMessages } from "@/lib/i18n/locale";
import { dateLocale } from "@/lib/i18n/config";

export const revalidate = 300;

function formatDate(dateIso: string, locale: "fr" | "en") {
  return new Date(dateIso).toLocaleDateString(dateLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ActualitesPage() {
  const locale = await getLocale();
  const t = await getMessages();
  const news = await getNews(locale);

  return (
    <div className="wrap">
      <PageTitle eyebrow={t.news.eyebrow} title={t.news.all} />
      <section className="pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px]">
          {news.map((article) => (
            <LocalizedLink
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
                <h3 className="text-white text-[15.5px] leading-snug mb-3 font-semibold line-clamp-3">
                  {article.title}
                </h3>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="bg-yellow text-navy-dark text-xs font-bold px-3.5 py-1.5 rounded-md">
                    {t.common.readArticle}
                  </span>
                  <span className="text-[11px] text-[#c3cee0]">{formatDate(article.date, locale)}</span>
                </div>
              </div>
            </LocalizedLink>
          ))}
        </div>
      </section>
    </div>
  );
}
