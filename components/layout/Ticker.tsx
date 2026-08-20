import { getTickerAnnouncements } from "@/lib/wordpress";
import { getLocale, getMessages } from "@/lib/i18n/locale";

export default async function Ticker() {
  const locale = await getLocale();
  const t = await getMessages();
  const announcements = await getTickerAnnouncements(locale);
  const baseItems = announcements.length > 0 ? announcements : [t.header.tickerFallback];
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
