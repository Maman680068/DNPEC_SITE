import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import ContentPlaceholder from "@/components/ui/ContentPlaceholder";

export const metadata: Metadata = { title: "Revue scientifique" };

export default function RevueScientifiquePage() {
  return (
    <div className="wrap">
      <PageTitle eyebrow="Recherche" title="Revue scientifique de la DNPEC" />
      <section className="pb-14 flex flex-col gap-10 max-w-3xl">
        <ContentPlaceholder>
          Les numéros publiés de la revue scientifique de la DNPEC seront disponibles ici en
          téléchargement.
        </ContentPlaceholder>
        <div id="soumission" className="scroll-mt-24">
          <h2 className="text-2xl text-navy relative pb-2.5 mb-5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-11 after:h-[3px] after:bg-yellow">
            Soumission d&apos;articles
          </h2>
          <ContentPlaceholder>
            Les modalités et le formulaire de soumission d&apos;articles pour la revue scientifique
            seront publiés ici.
          </ContentPlaceholder>
        </div>
      </section>
    </div>
  );
}
