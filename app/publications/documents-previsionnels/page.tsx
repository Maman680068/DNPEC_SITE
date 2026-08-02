import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import LinkCardGrid from "@/components/ui/LinkCardGrid";

export const metadata: Metadata = { title: "Documents prévisionnels" };

const cards = [
  {
    title: "Transition fiscale",
    description: "Documents et analyses relatifs à la transition fiscale.",
    href: "/transition-fiscale",
  },
  {
    title: "Rapport de suivi des indicateurs de transition fiscale",
    description: "Suivi périodique des indicateurs de la transition fiscale.",
    href: "/rapport-suivi-indicateurs-transition-fiscale",
  },
  {
    title: "PEF — Perspectives économiques et financières",
    description: "Perspectives économiques et financières de la Guinée.",
    href: "/perspectives-economiques-financieres",
  },
];

export default function DocumentsPrevisionnelsPage() {
  return (
    <div className="wrap">
      <PageTitle eyebrow="Publications" title="Documents prévisionnels" />
      <section className="pb-14">
        <LinkCardGrid cards={cards} />
      </section>
    </div>
  );
}
