import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import IndicateursSection from "@/components/home/IndicateursSection";
import { getIndicators, getRecentPublicationCards } from "@/lib/wordpress";

export const metadata: Metadata = { title: "Quelques chiffres" };
export const revalidate = 300;

export default async function QuelquesChiffresPage() {
  const [indicators, publications] = await Promise.all([getIndicators(), getRecentPublicationCards()]);

  return (
    <div className="wrap">
      <PageTitle eyebrow="Données" title="Quelques chiffres" />
      <section className="pb-14">
        <IndicateursSection indicators={indicators} publications={publications} />
      </section>
    </div>
  );
}
