import Link from "next/link";

type SectionHeadProps = {
  title: string;
  seeAllHref?: string;
  seeAllLabel?: string;
};

export default function SectionHead({ title, seeAllHref, seeAllLabel }: SectionHeadProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-[26px]">
      <h2 className="text-2xl text-navy relative pb-2.5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-11 after:h-[3px] after:bg-yellow">
        {title}
      </h2>
      {seeAllHref && (
        <Link
          href={seeAllHref}
          className="text-[13px] font-semibold text-navy flex items-center gap-1.5 shrink-0"
        >
          {seeAllLabel} →
        </Link>
      )}
    </div>
  );
}
