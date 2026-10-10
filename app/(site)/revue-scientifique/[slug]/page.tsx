import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LocalizedLink from "@/components/i18n/LocalizedLink";
import PageTitle from "@/components/ui/PageTitle";
import { getRpaeArticleBySlug } from "@/lib/wordpress";
import { getLocale, getMessages } from "@/lib/i18n/locale";
import { dateLocale } from "@/lib/i18n/config";

type RpaeArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: RpaeArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getRpaeArticleBySlug(slug);
  const t = await getMessages();
  return {
    title: article?.title ?? t.revueUi.articleFallback,
    description: article?.resume,
  };
}

function formatDate(dateIso: string, locale: "fr" | "en") {
  return new Date(dateIso).toLocaleDateString(dateLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function RpaeArticlePage({ params }: RpaeArticlePageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getMessages();
  const article = await getRpaeArticleBySlug(slug);

  if (!article) notFound();

  const profilLabel =
    t.rpae.profils[article.profil as keyof typeof t.rpae.profils] ?? article.profilLabel;

  return (
    <div className="wrap">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm text-muted mt-8 mb-2">
          <LocalizedLink href="/revue-scientifique" className="hover:text-navy hover:underline">
            {t.nav["/revue-scientifique"]}
          </LocalizedLink>
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
            {profilLabel}
            {" · "}
            {article.theme}
            {article.editionAnnee
              ? ` · ${t.revueUi.editionLabel.replace("{year}", article.editionAnnee)}`
              : ""}
            {" · "}
            {formatDate(article.date, locale)}
          </p>

          {article.resume ? (
            <div className="mb-8">
              <h2 className="text-navy font-bold text-base mb-2">{t.revueUi.abstract}</h2>
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
              {article.fichierNom
                ? `${t.revueUi.download} — ${article.fichierNom}`
                : t.revueUi.downloadDoc}
            </a>
          ) : (
            <p className="text-sm text-muted">{t.revueUi.fileLater}</p>
          )}

          <div className="mt-10 pt-6 border-t border-line">
            <LocalizedLink
              href="/revue-scientifique"
              className="text-sm font-semibold text-navy hover:underline"
            >
              {t.revueUi.back}
            </LocalizedLink>
          </div>
        </section>
      </div>
    </div>
  );
}
