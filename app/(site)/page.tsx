import NewsBanner from "@/components/home/NewsBanner";
import PageTitle from "@/components/ui/PageTitle";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import Hero from "@/components/home/Hero";
import IndicateursSection from "@/components/home/IndicateursSection";
import AboutSection from "@/components/home/AboutSection";
import ActualitesSection from "@/components/home/ActualitesSection";
import PublicationsSection from "@/components/home/PublicationsSection";
import PartnersSection from "@/components/home/PartnersSection";
import Newsletter from "@/components/home/Newsletter";
import LocaleFallbackNotice from "@/components/i18n/LocaleFallbackNotice";
import {
  getIndicators,
  getNews,
  getPartners,
  getRecentPublicationCards,
  buildNewsBannerSlides,
  CONJONCTURE_SLUGS,
} from "@/lib/wordpress";
import { getLocale, getMessages } from "@/lib/i18n/locale";

// Revalidation ISR explicite (déjà fixée à 300s au niveau du fetch dans
// lib/wordpress.ts) — documentée ici pour que la fréquence de rafraîchissement
// de cette route soit visible sans avoir à remonter jusqu'à la couche d'accès.
export const revalidate = 300;

export default async function Home() {
  const locale = await getLocale();
  const t = await getMessages();
  const [indicators, news, partners, recentPublications] = await Promise.all([
    getIndicators(),
    getNews(locale),
    getPartners(),
    getRecentPublicationCards(locale),
  ]);

  const latestNews = [...news]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const bannerNews = buildNewsBannerSlides(news, 8);

  // Mêmes documents conjoncturels qu'avant — la 1ʳᵉ page PDF s'affiche dans le Hero.
  const conjonctureCards = recentPublications.filter((card) => CONJONCTURE_SLUGS.has(card.slug));

  const showFrenchFallback =
    locale === "en" &&
    (news.some((article) => article.isLocaleFallback) ||
      bannerNews.some((article) => article.isLocaleFallback) ||
      latestNews.some((article) => article.isLocaleFallback));

  return (
    <>
      <NewsBanner articles={bannerNews} />

      <div className="wrap">
        {showFrenchFallback ? (
          <div className="pt-6">
            <LocaleFallbackNotice show />
          </div>
        ) : null}

        <RevealOnScroll>
          <IndicateursSection indicators={indicators} />
        </RevealOnScroll>

        <RevealOnScroll>
          <PageTitle eyebrow={t.home.eyebrow} title={t.home.newsConjoncture} />
        </RevealOnScroll>

        <RevealOnScroll delayMs={80}>
          <Hero publications={conjonctureCards} />
        </RevealOnScroll>

        <RevealOnScroll>
          <AboutSection />
        </RevealOnScroll>

        <RevealOnScroll>
          <ActualitesSection articles={latestNews} />
        </RevealOnScroll>

        <RevealOnScroll>
          <PublicationsSection />
        </RevealOnScroll>
      </div>

      <RevealOnScroll>
        <PartnersSection partners={partners} />
      </RevealOnScroll>

      <RevealOnScroll>
        <Newsletter />
      </RevealOnScroll>
    </>
  );
}
