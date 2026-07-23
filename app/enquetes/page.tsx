import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import ContentPlaceholder from "@/components/ui/ContentPlaceholder";

export const metadata: Metadata = { title: "Postuler aux enquêtes" };

export default function EnquetesPage() {
  return (
    <div className="wrap">
      <PageTitle eyebrow="Enquêtes" title="Postuler aux enquêtes" />
      <section className="pb-14 max-w-3xl">
        <ContentPlaceholder>
          Les appels à candidature pour les enquêteurs de la DNPEC seront publiés ici par la
          cellule éditoriale.
        </ContentPlaceholder>
      </section>
    </div>
  );
}
