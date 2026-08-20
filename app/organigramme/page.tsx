import PageTitle from "@/components/ui/PageTitle";
import OrgChartDesktop from "@/components/organigramme/OrgChartDesktop";
import OrgChartMobile from "@/components/organigramme/OrgChartMobile";
import OrgLegend from "@/components/organigramme/OrgLegend";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/organigramme");

export default async function OrganigrammePage() {
  const t = await getMessages();
  return (
    <div className="wrap">
      <PageTitle eyebrow={t.nav["/la-dnpec"]} title={t.nav["/organigramme"]} />
      <section className="pb-14">
        <OrgChartDesktop />
        <OrgChartMobile />
        <OrgLegend />
      </section>
    </div>
  );
}
