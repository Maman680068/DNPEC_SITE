import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import ContentPlaceholder from "@/components/ui/ContentPlaceholder";
import { getNewsBySlug } from "@/lib/wordpress";
import { extractImages } from "@/lib/extractImages";

type ActualitePageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: ActualitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  return { title: article?.title ?? "Actualité" };
}

function formatDate(dateIso: string) {
  return new Date(dateIso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ActualitePage({ params }: ActualitePageProps) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);

  if (!article) notFound();

  const { text: contentText, images: contentImages } = article.content
    ? extractImages(article.content)
    : { text: "", images: [] };

  return (
    <div className="wrap">
      <div className="max-w-5xl mx-auto">
        <PageTitle eyebrow={article.category} title={article.title} />
        <section className="pb-14">
          <p className="text-xs text-muted mb-6">{formatDate(article.date)}</p>
          {article.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full aspect-[21/9] object-cover rounded-lg mb-6"
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
            <ContentPlaceholder>
              Le texte complet, les photos et documents liés à cette actualité seront publiés ici par
              la cellule éditoriale, après validation du profil « Validateur / Publicateur ».
            </ContentPlaceholder>
          )}
        </section>
      </div>
    </div>
  );
}
