import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import ContentPlaceholder from "@/components/ui/ContentPlaceholder";
import { getNewsBySlug } from "@/lib/wordpress";

type ActualitePageProps = {
  params: Promise<{ slug: string }>;
};

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

  return (
    <div className="wrap">
      <PageTitle eyebrow={article.category} title={article.title} />
      <section className="pb-14 max-w-3xl">
        <p className="text-xs text-muted mb-6">{formatDate(article.date)}</p>
        <p className="text-[15px] text-muted leading-relaxed mb-6">{article.excerpt}</p>
        <ContentPlaceholder>
          Le texte complet, les photos et documents liés à cette actualité seront publiés ici par
          la cellule éditoriale, après validation du profil « Validateur / Publicateur ».
        </ContentPlaceholder>
      </section>
    </div>
  );
}
