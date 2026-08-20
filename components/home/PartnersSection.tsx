import type { Partner } from "@/lib/types";
import { getMessages } from "@/lib/i18n/locale";

type PartnersSectionProps = {
  partners: Partner[];
};

const BOTTOM_IDS = new Set(["simandou", "guinee"]);

function PartnerItem({
  partner,
  className = "",
}: {
  partner: Partner;
  className?: string;
}) {
  const content = partner.logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={partner.logoUrl}
      alt={partner.name}
      className="max-h-[72px] w-auto max-w-[160px] object-contain"
    />
  ) : (
    <span className="text-[12px] text-muted text-center font-semibold px-2">{partner.name}</span>
  );

  const classes = `flex items-center justify-center h-[100px] px-3 transition-opacity hover:opacity-80 ${className}`;

  if (partner.websiteUrl) {
    return (
      <a
        href={partner.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        title={`${partner.name} — site officiel`}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={classes} title={partner.name}>
      {content}
    </div>
  );
}

export default async function PartnersSection({ partners }: PartnersSectionProps) {
  const t = await getMessages();
  if (partners.length === 0) return null;

  const scrolling = partners.filter((p) => !BOTTOM_IDS.has(p.id));
  const bottom = partners.filter((p) => BOTTOM_IDS.has(p.id));
  const loop = scrolling.length > 0 ? [...scrolling, ...scrolling] : [];

  return (
    <div className="bg-white border-t border-b border-line py-12 md:py-14">
      <div className="wrap">
        <div className="mb-8 md:mb-10">
          <div className="text-xs font-semibold text-green uppercase tracking-wide">{t.home.partners}</div>
          <h2 className="text-2xl md:text-[28px] text-navy mt-2 font-heading font-semibold relative pb-2.5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-11 after:h-[3px] after:bg-yellow">
            {t.home.partnersTrust}
          </h2>
        </div>
      </div>

      {scrolling.length > 0 && (
        <div className="partners-marquee overflow-hidden w-full mb-6">
          <div className="partners-track flex items-center gap-10 w-max px-4">
            {loop.map((partner, index) => (
              <PartnerItem
                key={`${partner.id}-${index}`}
                partner={partner}
                className="w-[160px] shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {bottom.length > 0 && (
        <div className="wrap">
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16">
            {bottom.map((partner) => (
              <PartnerItem key={partner.id} partner={partner} className="min-w-[140px]" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
