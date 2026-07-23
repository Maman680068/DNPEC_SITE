import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import ContentPlaceholder from "@/components/ui/ContentPlaceholder";
import { getPublications } from "@/lib/wordpress";

type PublicationPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PublicationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const publications = await getPublications();
  const publication = publications.find((p) => p.slug === slug);
  return { title: publication?.title ?? "Publication" };
}

export default async function PublicationPage({ params }: PublicationPageProps) {
  const { slug } = await params;
  const publications = await getPublications();
  const publication = publications.find((p) => p.slug === slug);

  if (!publication) notFound();

  return (
    <div className="wrap">
      <PageTitle eyebrow="Publications" title={publication.title} />
      <section className="pb-14 max-w-3xl">
        <p className="text-[15px] text-muted leading-relaxed mb-6">{publication.description}</p>
        <ContentPlaceholder>
          Le document PDF associé à cette publication ({publication.year}) sera déposé ici par la
          cellule éditoriale, avec indication du poids du fichier et téléchargement direct.
        </ContentPlaceholder>
      </section>
    </div>
  );
}
