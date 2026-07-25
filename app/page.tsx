import PageTitle from "@/components/ui/PageTitle";
import Hero from "@/components/home/Hero";
import IndicateursSection from "@/components/home/IndicateursSection";
import ActualitesSection from "@/components/home/ActualitesSection";
import PublicationsSection from "@/components/home/PublicationsSection";
import PartnersSection from "@/components/home/PartnersSection";
import Newsletter from "@/components/home/Newsletter";
import { getIndicators, getNews, getPartners, getPublications } from "@/lib/wordpress";

// Revalidation ISR explicite (déjà fixée à 300s au niveau du fetch dans
// lib/wordpress.ts) — documentée ici pour que la fréquence de rafraîchissement
// de cette route soit visible sans avoir à remonter jusqu'à la couche d'accès.
export const revalidate = 300;

export default async function Home() {
  const [indicators, news, publications, partners] = await Promise.all([
    getIndicators(),
    getNews(),
    getPublications(),
    getPartners(),
  ]);

  const latestNews = [...news]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <>
      <div className="wrap">
        <PageTitle eyebrow="Accueil" title="Actualités & conjoncture" />

        <Hero
          tag="CONJONCTURE"
          title="Note de conjoncture économique du deuxième trimestre 2026"
          date="15 juillet 2026 · 10:30"
        />

        <IndicateursSection indicators={indicators} />

        <ActualitesSection articles={latestNews} />

        <PublicationsSection publications={publications} />
      </div>

      <PartnersSection partners={partners} />

      <Newsletter />
    </>
  );
}
