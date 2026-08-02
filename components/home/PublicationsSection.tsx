import Link from "next/link";
import type { Publication } from "@/lib/types";

type PublicationsSectionProps = {
  publications: Publication[];
};

export default function PublicationsSection({ publications }: PublicationsSectionProps) {
  return (
    <section className="pb-14">
      <div className="pub-hero relative rounded-[10px] overflow-hidden pt-10 sm:pt-[60px] px-5 sm:px-10 pb-[140px] sm:pb-[210px]">
        <div className="text-yellow text-xs font-bold tracking-wide uppercase">Publications</div>
        <h2 className="text-white text-2xl sm:text-[30px] mt-2.5">Retrouvez l&apos;information économique</h2>
      </div>
      <div className="relative -mt-[100px] sm:-mt-[170px] px-0 md:px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px]">
        {publications.map((publication) => (
          <Link
            key={publication.id}
            href={publication.href ?? `/publications/${publication.slug}`}
            className="doc-category-card rounded-[14px] p-7 block focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow focus-visible:outline-offset-2"
          >
            <div className="w-[34px] h-1.5 bg-yellow rounded-[3px] mb-4" />
            <h3 className="text-[17px] text-white font-semibold mb-2.5">{publication.title}</h3>
            <p className="text-[13px] text-[#c7d0e3] leading-relaxed mb-5">{publication.description}</p>
            <span className="text-yellow text-[13px] font-bold">Consulter →</span>
          </Link>
        ))}
      </div>
      <div className="h-6.5" />
    </section>
  );
}
