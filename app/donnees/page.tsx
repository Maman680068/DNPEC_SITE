import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import ContentPlaceholder from "@/components/ui/ContentPlaceholder";

export const metadata: Metadata = { title: "Données" };

const sections = [
  { id: "secteur-reel", title: "Secteur réel" },
  { id: "tofe", title: "Finances publiques (TOFE)" },
  { id: "balance-paiements", title: "Balance des paiements" },
  { id: "smi", title: "Situation monétaire intégrée (SMI)" },
];

export default function DonneesPage() {
  return (
    <div className="wrap">
      <PageTitle eyebrow="Données" title="Indicateurs et séries statistiques" />
      <section className="pb-14 flex flex-col gap-10">
        {sections.map((section) => (
          <div key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="text-2xl text-navy relative pb-2.5 mb-5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-11 after:h-[3px] after:bg-yellow">
              {section.title}
            </h2>
            <ContentPlaceholder>
              Les séries de données « {section.title} » seront publiées et mises à jour ici par la
              cellule éditoriale (portail de données interactives prévu en phase 2).
            </ContentPlaceholder>
          </div>
        ))}
      </section>
    </div>
  );
}
