import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import OrgChartDesktop from "@/components/organigramme/OrgChartDesktop";
import OrgChartMobile from "@/components/organigramme/OrgChartMobile";
import OrgLegend from "@/components/organigramme/OrgLegend";

export const metadata: Metadata = { title: "Organigramme" };

export default function OrganigrammePage() {
  return (
    <div className="wrap">
      <PageTitle eyebrow="La DNPEC" title="Organigramme" />
      <section className="pb-14">
        <OrgChartDesktop />
        <OrgChartMobile />
        <OrgLegend />
      </section>
    </div>
  );
}
