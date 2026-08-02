import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import RevueTabs, { type ArticleYearGroup } from "@/components/revue/RevueTabs";
import RpaeSubmissionForm from "@/components/revue/RpaeSubmissionForm";
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

        <section id="soumission" className="pb-14 scroll-mt-24">
          <h2 className="text-2xl text-navy relative pb-2.5 mb-5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-11 after:h-[3px] after:bg-yellow">
            Soumission d&apos;articles
          </h2>
          <p className="text-[15px] text-muted leading-relaxed mb-6 max-w-2xl">
            Soumettez votre article scientifique pour examen par le comité éditorial de la RPAE. Chaque soumission
            est reçue en brouillon et fait l&apos;objet d&apos;une validation manuelle avant toute publication.
          </p>
          <RpaeSubmissionForm />
        </section>
      </div>
    </div>
  );
}
