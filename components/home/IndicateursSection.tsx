import type { Indicator, PublicationCard } from "@/lib/types";
import PublicationsCarousel from "./PublicationsCarousel";

const toneClasses: Record<Indicator["tone"], string> = {
  green: "bg-[#E4F3EA] text-green",
  yellow: "bg-[#FCF1D3] text-[#B98A00]",
  red: "bg-[#FBE4E2] text-red",
  navy: "bg-[#E5E9F5] text-navy",
};

type IndicateursSectionProps = {
  indicators: Indicator[];
  publications: PublicationCard[];
};

export default function IndicateursSection({ indicators, publications }: IndicateursSectionProps) {
  return (
    <div className="indic-section rounded-[10px] p-8 mb-[52px] grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
      <div>
        <h3 className="text-white text-lg mb-[18px]">Nos indicateurs clés</h3>
        <div className="flex flex-col gap-3">
          {indicators.map((indicator) => (
            <div
              key={indicator.id}
              className="bg-white rounded-lg px-4 py-3.5 flex items-center gap-3.5"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${toneClasses[indicator.tone]}`}
              >
                {indicator.icon}
              </div>
              <div>
                <div className="text-xs text-muted">{indicator.label}</div>
                <div className="text-[19px] font-bold text-navy font-heading">{indicator.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <PublicationsCarousel publications={publications} />
    </div>
  );
}
