import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import ContentPlaceholder from "@/components/ui/ContentPlaceholder";

export const metadata: Metadata = { title: "Mot du Directeur National" };

export default function MotDuDirecteurPage() {
  return (
    <div className="wrap">
      <PageTitle eyebrow="La DNPEC" title="Mot du Directeur National" />
      <section className="pb-14 max-w-3xl">
        <ContentPlaceholder>
          Le message du Directeur National sera publié ici par la cellule éditoriale depuis le
          back-office WordPress.
        </ContentPlaceholder>
      </section>
    </div>
  );
}
