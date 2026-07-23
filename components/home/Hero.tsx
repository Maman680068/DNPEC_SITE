type HeroProps = {
  tag: string;
  title: string;
  date: string;
};

export default function Hero({ tag, title, date }: HeroProps) {
  return (
    <div className="hero-slider relative rounded-[10px] overflow-hidden h-[340px] mb-11">
      <div className="absolute left-9 bottom-8 right-9 text-white">
        <span className="inline-block bg-yellow text-navy-dark text-[11.5px] font-bold px-3 py-1.5 rounded mb-3.5">
          {tag}
        </span>
        <h2 className="text-[26px] max-w-[640px] leading-snug text-white font-semibold">{title}</h2>
        <div className="text-[12.5px] text-[#c3cee0] mt-2.5">{date}</div>
      </div>
      <div className="absolute top-1/2 left-0 right-0 flex justify-between px-[18px] -translate-y-1/2">
        <button
          type="button"
          aria-label="Publication précédente"
          className="w-[38px] h-[38px] rounded-full bg-white/15 border border-white/30 text-white flex items-center justify-center text-base cursor-pointer"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Publication suivante"
          className="w-[38px] h-[38px] rounded-full bg-white/15 border border-white/30 text-white flex items-center justify-center text-base cursor-pointer"
        >
          ›
        </button>
      </div>
    </div>
  );
}
