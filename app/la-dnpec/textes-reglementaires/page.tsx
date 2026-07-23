import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import ContentPlaceholder from "@/components/ui/ContentPlaceholder";

export const metadata: Metadata = { title: "Textes réglementaires" };

const textes = [
  { id: "loi-des-finances", title: "Loi des finances" },
  { id: "code-des-investissements", title: "Code des investissements" },
  { id: "code-general-des-impots", title: "Code général des impôts" },
  { id: "code-des-marches-publics", title: "Code des marchés publics" },
  { id: "code-minier", title: "Code minier" },
];

export default function TextesReglementairesPage() {
  return (
    <div className="wrap">
      <PageTitle eyebrow="La DNPEC" title="Textes réglementaires" />
      <section className="pb-14 max-w-3xl flex flex-col gap-10">
        {textes.map((texte) => (
          <div key={texte.id} id={texte.id} className="scroll-mt-24">
            <h2 className="text-2xl text-navy relative pb-2.5 mb-5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-11 after:h-[3px] after:bg-yellow">
              {texte.title}
            </h2>
            <ContentPlaceholder>
              Le texte « {texte.title} » sera déposé ici en PDF par la cellule éditoriale.
            </ContentPlaceholder>
          </div>
        ))}
      </section>
    </div>
  );
}
