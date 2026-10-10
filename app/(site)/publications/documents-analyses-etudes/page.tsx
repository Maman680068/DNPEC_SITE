import PageTitle from "@/components/ui/PageTitle";
import LinkCardGrid from "@/components/ui/LinkCardGrid";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";
import { navCards } from "@/lib/i18n/nav-cards";

export const generateMetadata = () => navTitleMetadata("/publications/documents-analyses-etudes");

const HREFS = [
  "/rapports-analyses-etudes",
  "/rapport-cpia",
  "/rapport-economique-financier",
  "/note-trimestrielle-analyse-economique",
  "/autres-etudes-economiques",
];

export default async function DocumentsAnalysesEtudesPage() {
  const t = await getMessages();
  return (
    <div className="wrap">
      <PageTitle eyebrow={t.nav["/publications"]} title={t.nav["/publications/documents-analyses-etudes"]} />
      <section className="pb-14">
        <LinkCardGrid cards={navCards(t, HREFS)} />
      </section>
    </div>
  );
}
