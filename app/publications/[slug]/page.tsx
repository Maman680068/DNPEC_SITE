import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import ContentPlaceholder from "@/components/ui/ContentPlaceholder";
import { getPublications } from "@/lib/wordpress";
import { getMessages } from "@/lib/i18n/locale";

type PublicationPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: PublicationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const publications = await getPublications();
  const publication = publications.find((p) => p.slug === slug);
  return { title: publication?.title ?? "Publication" };
}

export default async function PublicationPage({ params }: PublicationPageProps) {
  const { slug } = await params;
  const t = await getMessages();
  const publications = await getPublications();
  const publication = publications.find((p) => p.slug === slug);

  if (!publication) notFound();

  return (
    <div className="wrap">
      <PageTitle eyebrow={t.nav["/publications"]} title={publication.title} />
      <section className="pb-14 max-w-3xl">
        <p className="text-[15px] text-muted leading-relaxed mb-6">{publication.description}</p>
        <ContentPlaceholder>
          {t.ui.pdfPending.replace("{year}", String(publication.year))}
        </ContentPlaceholder>
      </section>
    </div>
  );
}
