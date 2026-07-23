import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import ContentPlaceholder from "@/components/ui/ContentPlaceholder";

export const metadata: Metadata = { title: "Organigramme" };

export default function OrganigrammePage() {
  return (
    <div className="wrap">
      <PageTitle eyebrow="La DNPEC" title="Organigramme" />
      <section className="pb-14 max-w-3xl">
        <ContentPlaceholder>
          L&apos;organigramme des services de la DNPEC sera publié ici par la cellule éditoriale.
        </ContentPlaceholder>
      </section>
    </div>
  );
}
