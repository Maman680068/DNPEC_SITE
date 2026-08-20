"use client";

import { ORG_LEGEND } from "@/lib/organigramme-data";
import { useMessages } from "@/lib/i18n/use-locale";

export default function OrgLegend() {
  const t = useMessages();
  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold text-navy mb-4">{t.orgLegend}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-[14px]">
        {ORG_LEGEND.map(({ code, label }) => (
          <div key={code} className="flex gap-2">
            <span className="font-bold text-navy shrink-0">{code}</span>
            <span className="text-muted">: {label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
