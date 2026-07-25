import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import LinkCardGrid from "@/components/ui/LinkCardGrid";

export const metadata: Metadata = { title: "Textes réglementaires" };

const cards = [
  {
    title: "Loi des finances",
    description: "Texte de la loi de finances en vigueur et ses annexes.",
    href: "/loi-des-finances",
  },
  {
    title: "Code des investissements",
    description: "Cadre juridique applicable aux investissements en Guinée.",
    href: "/code-des-investissements",
  },
  {
    title: "Code général des impôts",
    description: "Régime fiscal applicable aux personnes physiques et morales.",
    href: "/code-general-des-impots",
  },
  {
    title: "Code des marchés publics",
    description: "Règles de passation et d'exécution des marchés publics.",
    href: "/code-des-marches-publics",
  },
  {
    title: "Code minier",
    description: "Cadre juridique applicable au secteur minier guinéen.",
    href: "/code-minier",
  },
];

export default function TextesReglementairesPage() {
  return (
    <div className="wrap">
      <PageTitle eyebrow="La DNPEC" title="Textes réglementaires" />
      <section className="pb-14">
        <LinkCardGrid cards={cards} />
      </section>
    </div>
  );
}
