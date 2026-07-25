import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import LinkCardGrid from "@/components/ui/LinkCardGrid";

export const metadata: Metadata = { title: "La DNPEC" };

const cards = [
  {
    title: "Mot du Directeur National",
    description: "Message d'introduction du Directeur National de la DNPEC.",
    href: "/la-dnpec/mot-du-directeur",
  },
  {
    title: "Historique",
    description: "Les grandes étapes de la création et de l'évolution de la Direction.",
    href: "/la-dnpec/historique",
  },
  {
    title: "Mission",
    description: "Le rôle et les missions de la DNPEC en matière de prévision économique.",
    href: "/la-dnpec/mission",
  },
  {
    title: "Cabinet",
    description: "Composition du cabinet et des équipes de direction.",
    href: "/la-dnpec/cabinet",
  },
  {
    title: "Textes réglementaires",
    description: "Textes juridiques et réglementaires régissant la DNPEC.",
    href: "/la-dnpec/textes-reglementaires",
  },
  {
    title: "Organigramme",
    description: "Organisation interne et services de la Direction.",
    href: "/organigramme",
  },
];

export default function LaDnpecPage() {
  return (
    <div className="wrap">
      <PageTitle eyebrow="Présentation" title="La DNPEC" />
      <section className="pb-14">
        <LinkCardGrid cards={cards} />
      </section>
    </div>
  );
}
