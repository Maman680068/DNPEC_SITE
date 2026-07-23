import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import ContentPlaceholder from "@/components/ui/ContentPlaceholder";

export const metadata: Metadata = { title: "Cabinet" };

export default function CabinetPage() {
  return (
    <div className="wrap">
      <PageTitle eyebrow="La DNPEC" title="Cabinet" />
      <section className="pb-14 max-w-3xl">
        <ContentPlaceholder>
          La composition du Cabinet sera gérée par la cellule éditoriale depuis le back-office
          (fiches membres avec photo, fonction et rattachement).
        </ContentPlaceholder>
      </section>
    </div>
  );
}
