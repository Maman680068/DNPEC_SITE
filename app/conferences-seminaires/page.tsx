import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import ContentPlaceholder from "@/components/ui/ContentPlaceholder";

export const metadata: Metadata = { title: "Conférences & Séminaires" };

const sections = [
  { id: "journees-scientifiques", title: "Journées scientifiques" },
  { id: "conferences-periodiques", title: "Conférences périodiques" },
  { id: "seminaires-recherche", title: "Séminaires de recherche" },
];

export default function ConferencesSeminairesPage() {
  return (
    <div className="wrap">
      <PageTitle eyebrow="Événements" title="Conférences & Séminaires" />
      <section className="pb-14 flex flex-col gap-10">
        {sections.map((section) => (
          <div key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="text-2xl text-navy relative pb-2.5 mb-5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-11 after:h-[3px] after:bg-yellow">
              {section.title}
            </h2>
            <ContentPlaceholder>
              Les événements « {section.title} » (programme, dates, comptes rendus) seront publiés
              ici par la cellule éditoriale.
            </ContentPlaceholder>
          </div>
        ))}
      </section>
    </div>
  );
}
