import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import ContentPlaceholder from "@/components/ui/ContentPlaceholder";

export const metadata: Metadata = { title: "Mission" };

export default function MissionPage() {
  return (
    <div className="wrap">
      <PageTitle eyebrow="La DNPEC" title="Mission" />
      <section className="pb-14 max-w-3xl">
        <ContentPlaceholder>
          La présentation détaillée des missions de la Direction Nationale des Prévisions
          Économiques et de la Conjoncture sera publiée ici par la cellule éditoriale.
        </ContentPlaceholder>
      </section>
    </div>
  );
}
