import LocalizedLink from "@/components/i18n/LocalizedLink";
import { getMessages } from "@/lib/i18n/locale";

const CATEGORY_KEYS = [
  { key: "previsionnels" as const, href: "/publications/documents-previsionnels" },
  { key: "budgetaires" as const, href: "/publications/documents-budgetaires" },
  { key: "conjoncturels" as const, href: "/publications/documents-conjoncturels" },
  { key: "regionale" as const, href: "/documents-integration-regionale" },
  { key: "politique" as const, href: "/documents-politique-economique" },
  { key: "analyses" as const, href: "/publications/documents-analyses-etudes" },
  { key: "travail" as const, href: "/documents-travail" },
  { key: "statistiques" as const, href: "/documents-statistiques" },
];

export default async function PublicationsSection() {
  const t = await getMessages();
  return (
    <section className="pb-14">
      <div className="pub-hero relative rounded-[10px] overflow-hidden px-5 sm:px-8 pt-8 sm:pt-10 pb-16 sm:pb-[72px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-yellow/90 text-xs font-bold tracking-wide uppercase">{t.home.publicationsEyebrow}</div>
            <h2 className="text-white text-xl sm:text-[26px] mt-2 leading-snug">{t.home.publicationsTitle}</h2>
          </div>
          <LocalizedLink
            href="/publications"
            className="text-white/90 text-sm font-semibold hover:text-yellow hover:underline shrink-0"
          >
            {t.common.allPublications} →
          </LocalizedLink>
        </div>
      </div>

      <div className="relative -mt-10 sm:-mt-12 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {CATEGORY_KEYS.map((category) => (
          <LocalizedLink
            key={category.href}
            href={category.href}
            className="reveal-item doc-category-card group rounded-[14px] px-5 py-5 flex flex-col min-h-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy focus-visible:outline-offset-2"
          >
            <div className="w-8 h-1 bg-yellow rounded-full mb-3" />
            <h3 className="text-[15px] text-navy font-semibold leading-snug mb-2">{t.pubCats[category.key].title}</h3>
            <p className="text-[13px] text-muted leading-relaxed flex-1">{t.pubCats[category.key].description}</p>
            <span className="text-green text-[13px] font-bold mt-4 transition-colors group-hover:text-navy">
              {t.common.consult} →
            </span>
          </LocalizedLink>
        ))}
      </div>
    </section>
  );
}
