import Link from "next/link";
import type { Publication } from "@/lib/types";

type PublicationsSectionProps = {
  publications: Publication[];
};

export default function PublicationsSection({ publications }: PublicationsSectionProps) {
  return (
    <section className="pb-14">
      <div className="pub-hero relative rounded-[10px] overflow-hidden pt-[60px] px-10 pb-[210px]">
        <div className="text-yellow text-xs font-bold tracking-wide uppercase">Publications</div>
        <h2 className="text-white text-[30px] mt-2.5">Retrouvez l&apos;information économique</h2>
      </div>
      <div className="relative -mt-[170px] px-0 md:px-10 grid grid-cols-1 md:grid-cols-3 gap-[22px]">
        {publications.map((publication) => (
          <Link
            key={publication.id}
            href={`/publications/${publication.slug}`}
            className="bg-white rounded-[10px] p-6.5 shadow-[0_8px_24px_rgba(13,32,71,0.12)] block"
          >
            <div className="w-[34px] h-1.5 bg-green rounded-[3px] mb-4" />
            <h3 className="text-[17px] text-navy mb-2.5">{publication.title}</h3>
            <p className="text-[13px] text-muted leading-relaxed">{publication.description}</p>
          </Link>
        ))}
      </div>
      <div className="h-6.5" />
    </section>
  );
}
