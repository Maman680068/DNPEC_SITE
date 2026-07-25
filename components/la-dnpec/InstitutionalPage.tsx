import PageTitle from "@/components/ui/PageTitle";
import PageEnConstruction from "@/components/ui/PageEnConstruction";
import { getPageBySlug } from "@/lib/wordpress";

type InstitutionalPageProps = {
  /** Slug de la page côté WordPress (wp/v2/pages). */
  slug: string;
  /** Titre affiché tant qu'aucun contenu WordPress n'est publié pour ce slug. */
  fallbackTitle: string;
  eyebrow?: string;
};

export default async function InstitutionalPage({
  slug,
  fallbackTitle,
  eyebrow = "La DNPEC",
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
          <div className={page.coverImage ? "grid md:grid-cols-[240px_1fr] gap-8 items-start" : undefined}>
            {page.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={page.coverImage}
                alt={page.title || fallbackTitle}
                className="w-56 md:w-full aspect-[3/4] object-cover rounded-lg shadow-md mx-auto md:mx-0"
              />
            )}
            <div
              className="article-content text-[15px] text-ink leading-relaxed"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
