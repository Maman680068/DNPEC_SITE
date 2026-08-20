import PageTitle from "@/components/ui/PageTitle";
import LinkCardGrid from "@/components/ui/LinkCardGrid";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";
import { navCards } from "@/lib/i18n/nav-cards";

export const generateMetadata = () => navTitleMetadata("/publications/documents-previsionnels");

const HREFS = ["/transition-fiscale", "/perspectives-economiques-financieres"];

export default async function DocumentsPrevisionnelsPage() {
  const t = await getMessages();
  return (
    <div className="wrap">
      <PageTitle eyebrow={t.nav["/publications"]} title={t.nav["/publications/documents-previsionnels"]} />
      <section className="pb-14">
        <LinkCardGrid cards={navCards(t, HREFS)} />
      </section>
    </div>
  );
}
