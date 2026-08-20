import PageTitle from "@/components/ui/PageTitle";
import PageEnConstruction from "@/components/ui/PageEnConstruction";
import YearlyContentGrid from "@/components/la-dnpec/YearlyContentGrid";
import LocaleFallbackNotice from "@/components/i18n/LocaleFallbackNotice";
import { getPageBySlug } from "@/lib/wordpress";
import { getLocale, getMessages } from "@/lib/i18n/locale";

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
  const locale = await getLocale();
  const t = await getMessages();
  const page = await getPageBySlug(slug, locale);
  const displayEyebrow =
    eyebrow === "La DNPEC"
      ? t.nav["/la-dnpec"]
      : eyebrow === "Publications"
        ? t.nav["/publications"]
        : eyebrow === "Documents budgétaires"
          ? t.nav["/publications/documents-budgetaires"]
          : eyebrow === "Documents conjoncturels"
            ? t.nav["/publications/documents-conjoncturels"]
            : eyebrow === "Textes réglementaires"
              ? t.nav["/la-dnpec/textes-reglementaires"]
              : eyebrow === "Documents d'analyse et d'études économiques"
                ? t.nav["/publications/documents-analyses-etudes"]
                : t.nav[`/${slug}`] ??
                  Object.entries(t.nav).find(([, label]) => label === eyebrow)?.[1] ??
                  eyebrow;
  const translatedFallback =
    Object.entries(t.nav).find(([href]) => href === `/${slug}` || href.endsWith(`/${slug}`))?.[1] ?? fallbackTitle;

  if (!page) {
    return <PageEnConstruction title={translatedFallback} />;
  }

  return (
    <div className="wrap">
      <div className="max-w-5xl mx-auto">
        <PageTitle eyebrow={displayEyebrow} title={page.title || translatedFallback} />
        <section className="pb-14">
          <div className={page.coverImage ? "grid md:grid-cols-[340px_1fr] gap-8" : undefined}>
            {page.coverImage && (
              <div className="flex flex-col md:h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={page.coverImage}
                  alt={photoCaption?.name ?? page.title ?? fallbackTitle}
                  className="w-64 sm:w-80 md:w-full min-h-[240px] flex-1 object-cover object-top rounded-lg shadow-md mx-auto md:mx-0"
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
              <LocaleFallbackNotice show={!!page.isLocaleFallback} />
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
