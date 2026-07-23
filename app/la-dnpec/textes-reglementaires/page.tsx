import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import ContentPlaceholder from "@/components/ui/ContentPlaceholder";

export const metadata: Metadata = { title: "Textes réglementaires" };

export default function TextesReglementairesPage() {
  return (
    <div className="wrap">
      <PageTitle eyebrow="La DNPEC" title="Textes réglementaires" />
      <section className="pb-14 max-w-3xl">
        <ContentPlaceholder>
          Les textes juridiques et réglementaires régissant la DNPEC (décrets, arrêtés) seront
          déposés ici en PDF par la cellule éditoriale.
        </ContentPlaceholder>
      </section>
    </div>
  );
}
