import PageTitle from "@/components/ui/PageTitle";
import LinkCardGrid from "@/components/ui/LinkCardGrid";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";
import { navCards } from "@/lib/i18n/nav-cards";

export const generateMetadata = () => navTitleMetadata("/la-dnpec");

const HREFS = [
  "/la-dnpec/mot-du-directeur",
  "/la-dnpec/historique",
  "/la-dnpec/mission",
  "/la-dnpec/cabinet",
  "/la-dnpec/textes-reglementaires",
  "/organigramme",
];

export default async function LaDnpecPage() {
  const t = await getMessages();
  return (
    <div className="wrap">
      <PageTitle eyebrow={t.presentation} title={t.nav["/la-dnpec"]} />
      <section className="pb-14">
        <LinkCardGrid cards={navCards(t, HREFS)} />
      </section>
    </div>
  );
}
