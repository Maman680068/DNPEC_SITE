import type { Partner } from "@/lib/types";

type PartnersSectionProps = {
  partners: Partner[];
};

export default function PartnersSection({ partners }: PartnersSectionProps) {
  return (
    <div className="bg-white border-t border-b border-line py-10">
      <div className="wrap">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl text-navy">Nos partenaires</h2>
        </div>
        <div className="flex items-center justify-center gap-4 sm:gap-5 flex-wrap">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="w-[120px] h-16 rounded-lg bg-paper flex items-center justify-center text-[11px] text-muted text-center font-semibold border border-line px-2"
            >
              <span className="line-clamp-2 break-words">{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
