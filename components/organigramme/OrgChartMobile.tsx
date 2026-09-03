"use client";

import { useState } from "react";
import { ORG_CHART } from "@/lib/organigramme-data";
import NodeBox from "./NodeBox";

export default function OrgChartMobile() {
  const [openDivision, setOpenDivision] = useState<string | null>(null);

  return (
    <div className="lg:hidden flex flex-col items-center gap-3">
      <NodeBox code={ORG_CHART.dn} tone="navy" className="w-full max-w-xs" />
      <div className="text-navy/60 text-xl leading-none" aria-hidden="true">▾</div>
      <NodeBox code={ORG_CHART.dna} tone="navy" className="w-full max-w-xs" />

      <div className="w-full max-w-xs grid grid-cols-2 gap-3 mt-1">
        <div>
          <p className="text-[11px] text-muted uppercase tracking-wide mb-1.5 text-center">Rattaché au DN</p>
          <div className="flex flex-col gap-1.5">
            {ORG_CHART.dnAttachments.map((code) => (
              <NodeBox key={code} code={code} tone="navy" className="text-[12px] py-1.5" />
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] text-muted uppercase tracking-wide mb-1.5 text-center">Rattaché au DNA</p>
          <div className="flex flex-col gap-1.5">
            {ORG_CHART.dnaAttachments.map((code) => (
              <NodeBox
                key={code}
                code={code}
                tone="navy"
                className={`py-1.5 ${code.length > 8 ? "text-[10px] leading-tight" : "text-[12px]"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="text-navy/60 text-xl leading-none mt-1" aria-hidden="true">▾</div>

      <div className="w-full max-w-xs flex flex-col gap-2">
        {ORG_CHART.divisions.map((division) => {
          const isOpen = openDivision === division.code;
          return (
            <div key={division.code} className="rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenDivision(isOpen ? null : division.code)}
                aria-expanded={isOpen}
                className={`w-full flex items-center justify-between px-4 py-3 font-bold text-sm text-white bg-green rounded-md ${
                  division.provisional ? "border-2 border-dashed border-yellow" : ""
                }`}
              >
                <span>
                  {division.code}
                  {division.provisional && "*"}
                </span>
                <span className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▾</span>
              </button>
              {isOpen && (
                <div className="grid grid-cols-2 gap-2 p-3 bg-white border border-line border-t-0 rounded-b-md">
                  {division.sections.map((section) => (
                    <NodeBox
                      key={section.code}
                      code={section.code}
                      tone="yellow"
                      provisional={section.provisional}
                      className="text-[12px] py-2"
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="w-full max-w-xs bg-navy text-white text-center font-bold rounded-lg py-3.5 px-4 text-sm mt-2 shadow-[0_4px_14px_rgba(19,43,94,0.2)]">
        {ORG_CHART.bottomBand}
      </div>
    </div>
  );
}
