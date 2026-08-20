import PageTitle from "@/components/ui/PageTitle";
import IndicateursSection from "@/components/home/IndicateursSection";
import { getIndicators } from "@/lib/wordpress";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/quelques-chiffres");
export const revalidate = 300;

export default async function QuelquesChiffresPage() {
  const [indicators, t] = await Promise.all([getIndicators(), getMessages()]);

  return (
    <div className="wrap">
      <PageTitle eyebrow={t.nav["/donnees"]} title={t.nav["/quelques-chiffres"]} />
      <section className="pb-14">
        <IndicateursSection indicators={indicators} />
      </section>
    </div>
  );
}
