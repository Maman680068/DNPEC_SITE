import PageTitle from "@/components/ui/PageTitle";
import LinkCardGrid from "@/components/ui/LinkCardGrid";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";
import { navCards } from "@/lib/i18n/nav-cards";

export const generateMetadata = () => navTitleMetadata("/publications/documents-conjoncturels");

const HREFS = [
  "/tbmeg",
  "/rapport-regional-conjoncture",
  "/note-hebdomadaire-economie-guineenne",
  "/note-conjoncture-economique-guinee",
  "/autres-notes-techniques",
];

export default async function DocumentsConjoncturelsPage() {
  const t = await getMessages();
  return (
    <div className="wrap">
      <PageTitle eyebrow={t.nav["/publications"]} title={t.nav["/publications/documents-conjoncturels"]} />
      <section className="pb-14">
        <LinkCardGrid cards={navCards(t, HREFS)} />
      </section>
    </div>
  );
}
