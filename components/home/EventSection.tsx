import type { EventData } from "@/lib/types";

// Mapping couleur/statut volontairement simple — un statut non listé
// retombe sur un badge neutre plutôt que de planter ou rester non stylé.
const STATUS_CLASSES: Record<string, string> = {
  Terminé: "bg-yellow text-navy-dark",
  "En cours": "bg-green text-white",
};

function statusClass(status: string): string {
  return STATUS_CLASSES[status] ?? "bg-white/20 text-white";
}

type EventSectionProps = {
  event: EventData;
};

export default function EventSection({ event }: EventSectionProps) {
  const { status, dates, theme, speakerName, speakerTitle, speakerPhoto } = event;

  return (
    <section className="event-section relative rounded-[10px] overflow-hidden mb-11 p-8 md:p-10">
      <div className="flag-strip absolute top-0 left-0 right-0" />

      <div className="grid grid-cols-1 md:grid-cols-[140px_1fr_220px] gap-8 items-center">
        <div className="flex justify-center md:justify-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/logo-dnpec-clean.png" alt="" className="h-20 w-auto" />
        </div>

        <div>
          {(status || dates) && (
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {status && (
                <span
                  className={`inline-block text-[11.5px] font-bold px-3 py-1.5 rounded uppercase tracking-wide ${statusClass(status)}`}
                >
                  {status}
                </span>
              )}
              {dates && <span className="text-white text-[13px]">{dates}</span>}
            </div>
          )}
          {theme && (
            <div className="bg-white rounded-lg px-5 py-4 inline-block max-w-full">
              <div className="text-[11px] font-semibold text-green uppercase tracking-wide mb-1">Thème</div>
              <div className="text-navy font-semibold text-[15px] leading-snug">{theme}</div>
            </div>
          )}
        </div>

        {speakerName && (
          <div className="flex flex-col items-center text-center">
            {speakerPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={speakerPhoto}
                alt={speakerName}
                className="w-28 h-28 rounded-full object-cover border-4 border-white/20 mb-3"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-white/10 border-4 border-white/20 mb-3" />
            )}
            <div className="text-white font-semibold text-[15px]">{speakerName}</div>
            {speakerTitle && <div className="text-[#c3cee0] text-[12.5px] mt-0.5">{speakerTitle}</div>}
          </div>
        )}
      </div>
    </section>
  );
}
