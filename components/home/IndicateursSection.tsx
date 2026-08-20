"use client";

import type { ReactNode } from "react";
import type { Indicator } from "@/lib/types";
import CountUpNumber from "@/components/ui/CountUpNumber";
import { useMessages } from "@/lib/i18n/use-locale";

type IndicateursSectionProps = {
  indicators: Indicator[];
};

const ICONS: Record<string, ReactNode> = {
  croissance: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
      <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  inflation: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
      <path d="M4 16l5-5 4 3 7-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 6h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  deficit: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
      <path d="M12 3v3M12 18v3M7.5 8.5h9L12 13 7.5 8.5zM7.5 15.5h9L12 11l-4.5 4.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  endettement: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
      <path d="M4 16c3-6 5-8 8-8s5 2 8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 16h16v3H4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  courant: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 4a8 8 0 0 1 7 8H12V4z" fill="currentColor" />
    </svg>
  ),
};

function IndicatorIcon({ id }: { id: string }) {
  return ICONS[id] ?? ICONS.croissance;
}

export default function IndicateursSection({ indicators }: IndicateursSectionProps) {
  const t = useMessages();
  return (
    <section className="py-8 sm:py-10">
      <h2 className="text-center text-navy text-xl sm:text-2xl font-heading font-semibold mb-7">
        {t.home.indicators}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {indicators.map((indicator) => (
          <article
            key={indicator.id}
            className="reveal-item bg-white rounded-xl px-4 pt-6 pb-5 text-center shadow-[0_8px_24px_rgba(13,32,71,0.08)]"
          >
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-green text-white flex items-center justify-center">
              <IndicatorIcon id={indicator.id} />
            </div>
            <CountUpNumber
              value={indicator.value}
              className="block text-[1.65rem] sm:text-[1.85rem] font-heading font-bold text-red leading-none mb-3"
            />
            <p className="text-[13px] text-ink font-medium leading-snug">
              {t.indicators[indicator.id] ?? indicator.label}
            </p>
            {indicator.period ? (
              <p className="text-[12px] text-muted mt-1">{indicator.period}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
