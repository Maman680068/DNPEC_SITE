import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import ContentPlaceholder from "@/components/ui/ContentPlaceholder";

export const metadata: Metadata = { title: "Historique" };

export default function HistoriquePage() {
  return (
    <div className="wrap">
      <PageTitle eyebrow="La DNPEC" title="Historique" />
      <section className="pb-14 max-w-3xl">
        <ContentPlaceholder>
          Les grandes étapes de la création et de l&apos;évolution de la DNPEC seront publiées ici
          par la cellule éditoriale.
        </ContentPlaceholder>
      </section>
    </div>
  );
}
