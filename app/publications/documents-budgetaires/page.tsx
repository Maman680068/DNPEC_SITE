import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import LinkCardGrid from "@/components/ui/LinkCardGrid";

export const metadata: Metadata = { title: "Documents budgétaires" };

const cards = [
  {
    title: "TBFP",
    description: "Tableau de Bord Finances Publique.",
    href: "/tbfp",
  },
  {
    title: "TOFE",
    description: "Tableau des Opérations Financières de l'État.",
    href: "/tofe",
  },
];

export default function DocumentsBudgetairesPage() {
  return (
    <div className="wrap">
      <PageTitle eyebrow="Publications" title="Documents budgétaires" />
      <section className="pb-14">
        <LinkCardGrid cards={cards} />
      </section>
    </div>
  );
}
