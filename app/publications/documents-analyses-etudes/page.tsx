import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import LinkCardGrid from "@/components/ui/LinkCardGrid";

export const metadata: Metadata = { title: "Documents d'analyse et d'études économiques" };

const cards = [
  {
    title: "Rapports",
    description: "Rapports d'analyse économique de la DNPEC.",
    href: "/rapports-analyses-etudes",
  },
  {
    title: "Rapport CPIA",
    description: "Évaluation des politiques et institutions pour l'Afrique (CPIA).",
    href: "/rapport-cpia",
  },
  {
    title: "Rapport économique et financier (REF)",
    description: "Bilan économique et financier annuel.",
    href: "/rapport-economique-financier",
  },
  {
    title: "Note trimestrielle d'analyse économique",
    description: "Analyse trimestrielle de la conjoncture et des perspectives économiques.",
    href: "/note-trimestrielle-analyse-economique",
  },
  {
    title: "Autres études",
    description: "Autres études et analyses économiques de la DNPEC.",
    href: "/autres-etudes-economiques",
  },
];

export default function DocumentsAnalysesEtudesPage() {
  return (
    <div className="wrap">
      <PageTitle eyebrow="Publications" title="Documents d'analyse et d'études économiques" />
      <section className="pb-14">
        <LinkCardGrid cards={cards} />
      </section>
    </div>
  );
}
