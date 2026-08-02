import { getTickerAnnouncements } from "@/lib/wordpress";

const FALLBACK_ANNOUNCEMENTS = ["Bienvenue sur le site de la DNPEC — actualités et publications à venir."];

export default async function Ticker() {
  const announcements = await getTickerAnnouncements();
  const baseItems = announcements.length > 0 ? announcements : FALLBACK_ANNOUNCEMENTS;
  // La piste est dupliquée pour permettre un défilement continu (translateX -50%).
  const items = [...baseItems, ...baseItems];

  return (
    <div className="bg-green text-white overflow-hidden whitespace-nowrap relative">
      <div className="wrap flex items-center h-[38px] p-0">
        <div className="bg-green-dark h-full flex items-center px-4 text-[13px] shrink-0">📢</div>
        <div className="ticker-track text-[12.5px] font-medium tracking-wide">
          {items.map((item, index) => (
            <span key={index} className="flex items-center gap-[60px]">
              <span>{item}</span>
              <span aria-hidden="true">——</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
