import PageTitle from "@/components/ui/PageTitle";
import LinkCardGrid from "@/components/ui/LinkCardGrid";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";
import { navCards } from "@/lib/i18n/nav-cards";

export const generateMetadata = () => navTitleMetadata("/la-dnpec/textes-reglementaires");

const HREFS = [
  "/loi-des-finances",
  "/code-des-investissements",
  "/code-general-des-impots",
  "/code-des-marches-publics",
  "/code-minier",
];

export default async function TextesReglementairesPage() {
  const t = await getMessages();
  return (
    <div className="wrap">
      <PageTitle eyebrow={t.nav["/la-dnpec"]} title={t.nav["/la-dnpec/textes-reglementaires"]} />
      <section className="pb-14">
        <LinkCardGrid cards={navCards(t, HREFS)} />
      </section>
    </div>
  );
}
