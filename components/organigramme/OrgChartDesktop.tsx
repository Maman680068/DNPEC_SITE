import { ORG_CHART } from "@/lib/organigramme-data";
import NodeBox from "./NodeBox";
import Branch from "./Branch";
import { ConnectorChevron, ConnectorDown } from "./OrgConnector";

function AttachmentGroup({ label, codes }: { label: string; codes: string[] }) {
  return (
    <div className="flex flex-col items-center" style={{ minWidth: codes.length > 2 ? 320 : 220 }}>
      <p className="text-[12px] text-navy/70 font-semibold uppercase tracking-wide mb-1">{label}</p>
      <Branch
        items={codes}
        keyOf={(code) => code}
        columnMinWidth={codes.length > 2 ? 88 : 100}
        renderItem={(code) => (
          <NodeBox
            code={code}
            tone="navy"
            className={`w-full px-2 py-2.5 ${
              code.length > 8 ? "max-w-[104px] text-[9px] leading-tight" : "max-w-[90px] text-[12px]"
            }`}
          />
        )}
      />
    </div>
  );
}

export default function OrgChartDesktop() {
  const divisionColWidth = Math.max(
    ...ORG_CHART.divisions.map((d) => d.sections.length * 54 + 48),
    220,
  );

  return (
    <div className="hidden lg:block overflow-x-auto">
      <div
        className="px-6 py-8 flex flex-col items-center bg-white rounded-2xl border border-line shadow-[0_8px_32px_rgba(19,43,94,0.06)]"
        style={{ minWidth: divisionColWidth * 5 + 96 }}
      >
        <NodeBox code={ORG_CHART.dn} tone="navy" className="w-[152px] text-[15px]" />
        <ConnectorDown height={30} />
        <NodeBox code={ORG_CHART.dna} tone="navy" className="w-[152px] text-[15px]" />
        <ConnectorDown height={30} />

        <div className="w-full">
          <Branch
            items={ORG_CHART.divisions}
            keyOf={(division) => division.code}
            columnMinWidth={divisionColWidth}
            renderItem={(division) => (
              <div className="flex flex-col items-center w-full min-w-0 overflow-hidden">
                <NodeBox
                  code={division.code}
                  tone="green"
                  provisional={division.provisional}
                  className="w-full text-[14px]"
                />
                <ConnectorDown height={18} />
                <Branch
                  items={division.sections}
                  keyOf={(section) => section.code}
                  compact
                  columnMinWidth={Math.max(44, Math.floor(200 / division.sections.length) - 4)}
                  renderItem={(section) => (
                    <NodeBox
                      code={section.code}
                      tone="yellow"
                      provisional={section.provisional}
                      className="w-full max-w-[52px] text-[10px] px-1 py-2"
                    />
                  )}
                />
              </div>
            )}
          />
        </div>

        <ConnectorChevron />

        <div className="w-full bg-navy text-white text-center font-bold rounded-lg py-3.5 px-4 text-[15px] shadow-[0_4px_14px_rgba(19,43,94,0.2)]">
          {ORG_CHART.bottomBand}
        </div>

        <div className="w-full mt-12 pt-8 border-t-2 border-navy/15 flex items-start justify-center gap-24">
          <AttachmentGroup label="Rattaché au DN" codes={ORG_CHART.dnAttachments} />
          <AttachmentGroup label="Rattaché au DNA" codes={ORG_CHART.dnaAttachments} />
        </div>
      </div>
    </div>
  );
}
