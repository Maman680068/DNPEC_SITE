import Link from "next/link";

type LinkCard = {
  title: string;
  description: string;
  href: string;
};

export default function LinkCardGrid({ cards }: { cards: LinkCard[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px]">
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="bg-white rounded-[10px] p-6.5 shadow-[0_8px_24px_rgba(13,32,71,0.08)] block hover:shadow-[0_8px_24px_rgba(13,32,71,0.16)] transition-shadow"
        >
          <div className="w-[34px] h-1.5 bg-green rounded-[3px] mb-4" />
          <h3 className="text-[17px] text-navy mb-2.5">{card.title}</h3>
          <p className="text-[13px] text-muted leading-relaxed">{card.description}</p>
        </Link>
      ))}
    </div>
  );
}
