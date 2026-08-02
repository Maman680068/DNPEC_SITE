import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import RevueTabs, { type ArticleYearGroup } from "@/components/revue/RevueTabs";
import { getPageBySlug } from "@/lib/wordpress";

export const metadata: Metadata = { title: "Revue Scientifique" };
export const revalidate = 300;

export default async function RevueScientifiquePage() {
  const [presentation, equipe, instructions] = await Promise.all([
    getPageBySlug("rpae-presentation"),
    getPageBySlug("rpae-equipe-editoriale"),
    getPageBySlug("rpae-instructions-auteurs"),
  ]);

  // Phase B (espace de soumission) alimentera cette liste une fois les
  // articles validés et publiés — vide tant qu'aucun n'existe.
  const articlesByYear: ArticleYearGroup[] = [];

  return (
    <div className="wrap">
      <div className="max-w-5xl mx-auto">
        <PageTitle
          eyebrow="Publications"
          title="Revue Scientifique"
          subtitle="Revue de Prévision et d'Analyse Économique (RPAE)"
        />
        <section className="pb-14">
          <RevueTabs
            presentation={presentation}
            equipe={equipe}
            instructions={instructions}
            articlesByYear={articlesByYear}
          />
        </section>
      </div>
    </div>
  );
}
