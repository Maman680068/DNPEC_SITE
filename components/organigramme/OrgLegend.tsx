"use client";

import { ORG_LEGEND } from "@/lib/organigramme-data";
import { useMessages } from "@/lib/i18n/use-locale";

export default function OrgLegend() {
  const t = useMessages();
  return (
    <div className="mt-12">
      <div className="rounded-2xl border border-line bg-white px-6 py-8 shadow-[0_8px_32px_rgba(19,43,94,0.06)] sm:px-8 sm:py-10">
        <h2 className="text-xl sm:text-2xl font-bold text-navy mb-6 sm:mb-8">{t.orgLegend}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-14 gap-y-3.5 text-[15px] sm:text-[16px] leading-relaxed">
          {ORG_LEGEND.map(({ code, label }) => (
            <div key={code} className="flex gap-2.5 items-baseline">
              <span className="font-bold text-navy shrink-0 min-w-[4.5rem]">{code}</span>
              <span className="text-navy/75">: {label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
