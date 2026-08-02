import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import { getRpaeArticleBySlug } from "@/lib/wordpress";

type RpaeArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: RpaeArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getRpaeArticleBySlug(slug);
  return {
    title: article?.title ?? "Article RPAE",
    description: article?.resume,
  };
}

function formatDate(dateIso: string) {
  return new Date(dateIso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function RpaeArticlePage({ params }: RpaeArticlePageProps) {
  const { slug } = await params;
  const article = await getRpaeArticleBySlug(slug);

  if (!article) notFound();

  return (
    <div className="wrap">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm text-muted mt-8 mb-2">
          <Link href="/revue-scientifique" className="hover:text-navy hover:underline">
            Revue Scientifique
          </Link>
          <span className="mx-1.5">/</span>
          <span>{article.year}</span>
        </p>
        <PageTitle eyebrow="RPAE" title={article.title} />
        <section className="pb-14">
          <p className="text-sm text-muted mb-1">
            {article.auteur}
            {article.gradeAuteur ? ` · ${article.gradeAuteur}` : ""}
            {article.fonctionAuteur ? ` · ${article.fonctionAuteur}` : ""}
          </p>
          <p className="text-sm text-muted mb-6">
            {article.profilLabel}
            {" · "}
            {article.theme}
            {article.editionAnnee ? ` · Édition ${article.editionAnnee}` : ""}
            {" · "}
            {formatDate(article.date)}
          </p>

          {article.resume ? (
            <div className="mb-8">
              <h2 className="text-navy font-bold text-base mb-2">Résumé</h2>
              <p className="text-[15px] text-ink leading-relaxed">{article.resume}</p>
            </div>
          ) : null}

          {article.fichierUrl ? (
            <a
              href={article.fichierUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-yellow text-navy-dark font-bold text-sm px-6 h-11 rounded-lg hover:brightness-95 transition-[filter]"
            >
              Télécharger{article.fichierNom ? ` — ${article.fichierNom}` : " le document"}
            </a>
          ) : (
            <p className="text-sm text-muted">
              Le fichier de cet article sera disponible après publication du document associé.
            </p>
          )}

          <div className="mt-10 pt-6 border-t border-line">
            <Link href="/revue-scientifique" className="text-sm font-semibold text-navy hover:underline">
              ← Retour au catalogue RPAE
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
