import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import LinkCardGrid from "@/components/ui/LinkCardGrid";

export const metadata: Metadata = { title: "Documents conjoncturels" };

const cards = [
  {
    title: "TBMEG",
    description: "Tableau de Bord Mensuel de l'Économie Guinéenne.",
    href: "/tbmeg",
  },
  {
    title: "Rapport régional de conjoncture (RRC)",
    description: "Analyse conjoncturelle à l'échelle régionale.",
    href: "/rapport-regional-conjoncture",
  },
  {
    title: "Note hebdomadaire de l'économie guinéenne",
    description: "Suivi hebdomadaire des principaux indicateurs économiques.",
    href: "/note-hebdomadaire-economie-guineenne",
  },
  {
    title: "Note de conjoncture économique de la Guinée",
    description: "Analyse périodique de la conjoncture économique nationale.",
    href: "/note-conjoncture-economique-guinee",
  },
  {
    title: "Autres notes techniques",
    description: "Autres notes et documents techniques de conjoncture.",
    href: "/autres-notes-techniques",
  },
];

export default function DocumentsConjoncturelsPage() {
  return (
    <div className="wrap">
      <PageTitle eyebrow="Publications" title="Documents conjoncturels" />
      <section className="pb-14">
        <LinkCardGrid cards={cards} />
      </section>
    </div>
  );
}
