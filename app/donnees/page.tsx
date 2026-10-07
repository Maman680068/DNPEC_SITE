import PageTitle from "@/components/ui/PageTitle";
import PageEnConstruction from "@/components/ui/PageEnConstruction";
import DonneesSection from "@/components/donnees/DonneesSection";
import { getDonnees, rubriqueTitle, sourceText } from "@/lib/donnees";
import { getLocale, getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/donnees");

export default async function DonneesPage() {
  const [locale, t, data] = await Promise.all([getLocale(), getMessages(), getDonnees()]);
  if (!data || data.rubriques.length === 0) {
    return <PageEnConstruction title={t.nav["/donnees"]} />;
  }
  const colon = locale === "en" ? ":" : " :";

  return (
    <div className="wrap pb-14">
      <PageTitle
        eyebrow={t.nav["/donnees"]}
        title={t.donnees.title}
        subtitle={`${t.donnees.subtitle(data.premiereAnnee, data.derniereAnnee)} ${t.donnees.sourceLabel}${colon} ${sourceText(
          data,
          locale,
        )}.`}
      />

      <nav aria-label={t.donnees.jumpTo} className="flex flex-wrap gap-2 mb-6">
        {data.rubriques.map((rubrique) => (
          <a
            key={rubrique.cle}
            href={`#${rubrique.cle}`}
            className="rounded-full bg-white border border-line px-3.5 py-1.5 text-[13px] font-semibold text-navy hover:border-green hover:text-green transition-colors"
          >
            {rubriqueTitle(rubrique.cle, locale)}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-6">
        {data.rubriques.map((rubrique) => (
          <DonneesSection key={rubrique.cle} data={data} rubrique={rubrique} locale={locale} />
        ))}
      </div>
    </div>
  );
}
