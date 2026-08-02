import type { Metadata } from "next";
import Link from "next/link";
import PageTitle from "@/components/ui/PageTitle";
import RevueTabs from "@/components/revue/RevueTabs";
import { getPageBySlug, getPublishedRpaeArticles } from "@/lib/wordpress";

export const metadata: Metadata = { title: "Revue Scientifique" };
export const revalidate = 300;

export default async function RevueScientifiquePage() {
  const [presentation, equipe, instructions, articles] = await Promise.all([
    getPageBySlug("rpae-presentation"),
    getPageBySlug("rpae-equipe-editoriale"),
    getPageBySlug("rpae-instructions-auteurs"),
    getPublishedRpaeArticles(),
  ]);

  return (
    <div className="wrap">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PageTitle
            eyebrow="Publications"
            title="Revue Scientifique"
            subtitle="Revue de Prévision et d'Analyse Économique (RPAE)"
          />
          <Link
            href="/revue-scientifique/soumettre"
            className="inline-flex items-center justify-center bg-yellow text-navy-dark font-bold text-sm px-6 h-11 rounded-lg hover:brightness-95 transition-[filter] mt-[34px] shrink-0"
          >
            Soumettre un article
          </Link>
        </div>
        <section className="pb-14">
          <RevueTabs
            presentation={presentation}
            equipe={equipe}
            instructions={instructions}
            articles={articles}
          />
        </section>
      </div>
    </div>
  );
}
