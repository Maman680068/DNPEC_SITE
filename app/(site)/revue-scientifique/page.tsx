import LocalizedLink from "@/components/i18n/LocalizedLink";
import PageTitle from "@/components/ui/PageTitle";
import RevueTabs from "@/components/revue/RevueTabs";
import { getPageBySlug, getPublishedRpaeArticles } from "@/lib/wordpress";
import { getLocale, getMessages } from "@/lib/i18n/locale";

export const revalidate = 300;

export default async function RevueScientifiquePage() {
  const locale = await getLocale();
  const t = await getMessages();
  const [presentation, equipe, instructions, articles] = await Promise.all([
    getPageBySlug("rpae-presentation", locale),
    getPageBySlug("rpae-equipe-editoriale", locale),
    getPageBySlug("rpae-instructions-auteurs", locale),
    getPublishedRpaeArticles(),
  ]);

  return (
    <div className="wrap overflow-x-clip">
      <div className="max-w-6xl mx-auto min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PageTitle
            eyebrow={t.revue.eyebrow}
            title={t.revue.title}
            subtitle={t.revue.subtitle}
            compact
          />
          <LocalizedLink
            href="/revue-scientifique/soumettre"
            className="inline-flex items-center justify-center bg-yellow text-navy-dark font-bold text-sm px-6 h-11 rounded-lg hover:brightness-95 transition-[filter] shrink-0"
          >
            {t.common.submitArticle}
          </LocalizedLink>
        </div>
        <section className="pb-14 min-w-0">
          <RevueTabs
            presentation={presentation}
            equipe={equipe}
            instructions={instructions}
            articles={articles}
          />
        </section>
      </div>
    </div>
  );
}
