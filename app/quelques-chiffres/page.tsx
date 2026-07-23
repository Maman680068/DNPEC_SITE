import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import IndicateursSection from "@/components/home/IndicateursSection";
import { getIndicators } from "@/lib/wordpress";

export const metadata: Metadata = { title: "Quelques chiffres" };

export default async function QuelquesChiffresPage() {
  const indicators = await getIndicators();

  return (
    <div className="wrap">
      <PageTitle eyebrow="Données" title="Quelques chiffres" />
      <section className="pb-14">
        <IndicateursSection indicators={indicators} />
      </section>
    </div>
  );
}
