import { ORG_CHART } from "@/lib/organigramme-data";
import NodeBox from "./NodeBox";
import Branch from "./Branch";

function VLine({ height = 20 }: { height?: number }) {
  return <div className="w-px bg-navy/25 mx-auto" style={{ height }} />;
}

function AttachmentGroup({ label, codes }: { label: string; codes: string[] }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[11px] text-muted uppercase tracking-wide">{label}</p>
      <div className="flex gap-3">
        {codes.map((code) => (
          <NodeBox key={code} code={code} tone="navy" className="w-[120px]" />
        ))}
      </div>
    </div>
  );
}

export default function OrgChartDesktop() {
  return (
    <div className="hidden lg:block overflow-x-auto">
      <div className="min-w-[1100px] px-4 pb-8 flex flex-col items-center">
        <NodeBox code={ORG_CHART.dn} tone="navy" className="w-[140px]" />
        <VLine />
        <NodeBox code={ORG_CHART.dna} tone="navy" className="w-[140px]" />
        <VLine />

        <div className="w-full">
          <Branch
            items={ORG_CHART.divisions}
            keyOf={(division) => division.code}
            renderItem={(division) => (
              <div className="flex flex-col items-center w-full">
                <NodeBox code={division.code} tone="green" provisional={division.provisional} className="w-full" />
                <VLine height={16} />
                <Branch
                  items={division.sections}
                  keyOf={(section) => `${division.code}-${section.code}`}
                  renderItem={(section) => (
                    <NodeBox
                      code={section.code}
                      tone="yellow"
                      provisional={section.provisional}
                      className="w-full text-[11px] px-1.5 py-2"
                    />
                  )}
                />
              </div>
            )}
          />
        </div>

        <div className="text-navy/40 text-xl leading-none my-3">▾</div>

        <div className="w-full bg-navy text-white text-center font-bold rounded-md py-3 px-4 text-sm">
          {ORG_CHART.bottomBand}
        </div>

        {/* Rattachements directs (hors chaîne des 5 divisions) */}
        <div className="w-full mt-10 pt-6 border-t border-line flex items-start justify-center gap-16">
          <AttachmentGroup label="Rattaché au DN" codes={ORG_CHART.dnAttachments} />
          <AttachmentGroup label="Rattaché au DNA" codes={ORG_CHART.dnaAttachments} />
        </div>
      </div>
    </div>
  );
}
