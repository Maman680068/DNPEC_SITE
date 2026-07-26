import PageTitle from "@/components/ui/PageTitle";
import PageEnConstruction from "@/components/ui/PageEnConstruction";
import YearlyContentGrid from "@/components/la-dnpec/YearlyContentGrid";
import { getPageBySlug } from "@/lib/wordpress";

type PhotoCaption = {
  name: string;
  role?: string;
};

type InstitutionalPageProps = {
  /** Slug de la page côté WordPress (wp/v2/pages). */
  slug: string;
  /** Titre affiché tant qu'aucun contenu WordPress n'est publié pour ce slug. */
  fallbackTitle: string;
  eyebrow?: string;
  /** Légende affichée sous la photo (ex. nom/fonction d'une personne) — n'a de sens que pour certaines pages. */
  photoCaption?: PhotoCaption;
  /** Contenu classé par année (ex. tableaux de bord mensuels) : affiché en grille 2 colonnes plutôt qu'empilé. */
  yearlyGrid?: boolean;
};

export default async function InstitutionalPage({
  slug,
  fallbackTitle,
  eyebrow = "La DNPEC",
  photoCaption,
  yearlyGrid = false,
}: InstitutionalPageProps) {
  const page = await getPageBySlug(slug);

  if (!page) {
    return <PageEnConstruction title={fallbackTitle} />;
  }

  return (
    <div className="wrap">
      <div className="max-w-5xl mx-auto">
        <PageTitle eyebrow={eyebrow} title={page.title || fallbackTitle} />
        <section className="pb-14">
          <div className={page.coverImage ? "grid md:grid-cols-[340px_1fr] gap-8" : undefined}>
            {page.coverImage && (
              <div className="flex flex-col md:h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={page.coverImage}
                  alt={photoCaption?.name ?? page.title ?? fallbackTitle}
                  className="w-64 sm:w-80 md:w-full min-h-[240px] flex-1 object-cover rounded-lg shadow-md mx-auto md:mx-0"
                />
                {photoCaption && (
                  <div className="mt-3 text-center md:text-left">
                    <p className="text-navy font-bold text-sm">{photoCaption.name}</p>
                    {photoCaption.role && <p className="text-muted text-xs mt-0.5">{photoCaption.role}</p>}
                  </div>
                )}
              </div>
            )}
            <div
              className={`article-content text-[15px] text-ink leading-relaxed${yearlyGrid ? " yearly-doc-content" : ""}`}
            >
              {yearlyGrid ? (
                <YearlyContentGrid html={page.content} />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: page.content }} />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
