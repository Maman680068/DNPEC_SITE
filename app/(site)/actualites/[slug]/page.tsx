import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import ContentPlaceholder from "@/components/ui/ContentPlaceholder";
import LocaleFallbackNotice from "@/components/i18n/LocaleFallbackNotice";
import { getNewsBySlug } from "@/lib/wordpress";
import { extractImages } from "@/lib/extractImages";
import { getLocale, getMessages } from "@/lib/i18n/locale";
import { dateLocale } from "@/lib/i18n/config";

type ActualitePageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: ActualitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const article = await getNewsBySlug(slug, locale);
  return { title: article?.title ?? "News" };
}

function formatDate(dateIso: string, locale: "fr" | "en") {
  return new Date(dateIso).toLocaleDateString(dateLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ActualitePage({ params }: ActualitePageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getMessages();
  const article = await getNewsBySlug(slug, locale);

  if (!article) notFound();

  const { text: contentText, images: contentImages } = article.content
    ? extractImages(article.content)
    : { text: "", images: [] };

  return (
    <div className="wrap">
      <div className="max-w-5xl mx-auto">
        <PageTitle eyebrow={article.category} title={article.title} />
        <section className="pb-14">
          <LocaleFallbackNotice show={!!article.isLocaleFallback} />
          <p className="text-xs text-muted mb-6">{formatDate(article.date, locale)}</p>
          {article.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full aspect-[16/9] object-cover object-top rounded-lg mb-6"
            />
          )}
          {article.content ? (
            <>
              <div
                className="article-content text-[15px] text-ink leading-relaxed"
                dangerouslySetInnerHTML={{ __html: contentText }}
              />
              {contentImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6 mb-6">
                  {contentImages.map((img, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg bg-line">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <ContentPlaceholder>{t.ui.newsPending}</ContentPlaceholder>
          )}
        </section>
      </div>
    </div>
  );
}
