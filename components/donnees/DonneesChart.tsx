"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/donnees-format";

export type ChartSeries = {
  key: string;
  label: string;
  /** Valeurs dans l'unité d'affichage (pourcentages × 100), une par année. */
  values: (number | null)[];
};

type DonneesChartProps = {
  title: string;
  unit: string;
  type: "bar" | "line";
  locale: Locale;
  decimals: number;
  years: { annee: number; estimate: boolean }[];
  series: ChartSeries[];
  labels: { estimate: string; estimateShort: string };
};

// Couleurs validées (lisibles en cas de daltonisme, contraste ≥ 3:1 sur blanc) :
// vert du site puis bleu, toujours dans cet ordre.
const COLORS = ["#0f6b3c", "#5b8ed6"];
const GRID = "#e4e6ea";
const ZERO = "#9aa1ad";
const MUTED = "#5b6270";
const INK = "#132b5e";
const MARGIN = { top: 22, right: 12, bottom: 40 };

function niceStep(raw: number): number {
  const power = Math.pow(10, Math.floor(Math.log10(raw)));
  const fraction = raw / power;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return nice * power;
}

function niceTicks(min: number, max: number, count = 4): { ticks: number[]; step: number } {
  const lo = Math.min(0, min);
  const hi = Math.max(0, max);
  const step = niceStep((hi - lo || 1) / count);
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) ticks.push(Number(v.toFixed(10)));
  return { ticks, step };
}

/** Barre à extrémité arrondie (4 px) côté valeur, carrée côté ligne de base. */
function barPath(x: number, w: number, base: number, end: number): string {
  const r = Math.min(4, w / 2, Math.abs(base - end));
  if (end <= base) {
    return `M${x},${base}V${end + r}Q${x},${end} ${x + r},${end}H${x + w - r}Q${x + w},${end} ${x + w},${end + r}V${base}Z`;
  }
  return `M${x},${base}V${end - r}Q${x},${end} ${x + r},${end}H${x + w - r}Q${x + w},${end} ${x + w},${end - r}V${base}Z`;
}

export default function DonneesChart({ title, unit, type, locale, decimals, years, series, labels }: DonneesChartProps) {
  const uid = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const height = width < 480 ? 220 : 260;
  const all = series.flatMap((s) => s.values).filter((v): v is number => v !== null);
  const { ticks, step } = niceTicks(Math.min(...all), Math.max(...all));
  const domMin = ticks[0];
  const domMax = ticks[ticks.length - 1];
  const tickDecimals = step >= 1 ? 0 : step >= 0.1 ? 1 : 2;
  const tickLabels = ticks.map((t) => formatNumber(t, tickDecimals, locale));
  const left = Math.max(...tickLabels.map((l) => l.length)) * 7 + 14;
  const plotW = width - left - MARGIN.right;
  const plotH = height - MARGIN.top - MARGIN.bottom;
  const y = (v: number) => MARGIN.top + ((domMax - v) / (domMax - domMin)) * plotH;
  const bandW = plotW / years.length;
  const cx = (i: number) => left + bandW * (i + 0.5);

  const n = series.length;
  const gap = 2;
  const barW = Math.max(6, Math.min(24, (bandW * 0.62 - gap * (n - 1)) / n));
  const groupW = n * barW + gap * (n - 1);
  const fmt = (v: number) => formatNumber(v, decimals, locale);
  const lastIndex = (values: (number | null)[]) => {
    for (let i = values.length - 1; i >= 0; i -= 1) if (values[i] !== null) return i;
    return -1;
  };

  const tooltipWidth = 230;
  const tooltipLeft =
    active === null ? 0 : Math.min(Math.max(cx(active) - tooltipWidth / 2, 0), Math.max(0, width - tooltipWidth));

  return (
    <figure className="m-0">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5 mb-2">
        <span className="text-[15px] font-semibold text-navy">
          {title} <span className="font-normal text-muted">({unit})</span>
        </span>
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted">
          {n > 1
            ? series.map((s, i) => (
                <span key={s.key} className="inline-flex items-center gap-1.5">
                  {type === "bar" ? (
                    <span className="inline-block w-2.5 h-2.5 rounded-[2px]" style={{ background: COLORS[i] }} />
                  ) : (
                    <span className="inline-block w-3.5 h-0.5 rounded" style={{ background: COLORS[i] }} />
                  )}
                  {s.label}
                </span>
              ))
            : null}
          {years.some((yr) => yr.estimate) ? (
            <span className="inline-flex items-center gap-1.5">
              {type === "bar" ? (
                <svg width="10" height="10" aria-hidden="true">
                  <rect width="10" height="10" rx="2" fill={`url(#${uid}-legend)`} />
                </svg>
              ) : (
                <svg width="22" height="10" aria-hidden="true">
                  <line x1="0" y1="5" x2="14" y2="5" stroke={MUTED} strokeWidth="2" strokeDasharray="3 3" />
                  <circle cx="17" cy="5" r="3" fill="#fff" stroke={MUTED} strokeWidth="2" />
                </svg>
              )}
              {labels.estimate}
            </span>
          ) : null}
        </span>
      </figcaption>

      <div ref={containerRef} className="relative w-full">
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`${title} (${unit})`}
          className="block max-w-full"
          onPointerLeave={() => setActive(null)}
        >
          <defs>
            {COLORS.map((color, i) => (
              <pattern
                key={color}
                id={`${uid}-hatch-${i}`}
                patternUnits="userSpaceOnUse"
                width="6"
                height="6"
                patternTransform="rotate(45)"
              >
                <rect width="6" height="6" fill={color} fillOpacity="0.22" />
                <rect width="3" height="6" fill={color} />
              </pattern>
            ))}
            <pattern id={`${uid}-legend`} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
              <rect width="6" height="6" fill={MUTED} fillOpacity="0.22" />
              <rect width="3" height="6" fill={MUTED} />
            </pattern>
          </defs>

          {active !== null ? (
            <rect x={left + bandW * active} y={MARGIN.top} width={bandW} height={plotH} fill="#f4f5f7" />
          ) : null}

          {ticks.map((t, i) => (
            <g key={t}>
              <line x1={left} x2={left + plotW} y1={y(t)} y2={y(t)} stroke={t === 0 && domMin < 0 ? ZERO : GRID} strokeWidth="1" />
              <text x={left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill={MUTED} style={{ fontVariantNumeric: "tabular-nums" }}>
                {tickLabels[i]}
              </text>
            </g>
          ))}

          {years.map((yr, i) => (
            <text key={yr.annee} x={cx(i)} y={height - MARGIN.bottom + 16} textAnchor="middle" fontSize="11" fill={MUTED}>
              {yr.annee}
              {yr.estimate ? (
                <tspan x={cx(i)} dy="13" fontSize="10" fontStyle="italic">
                  {labels.estimateShort}
                </tspan>
              ) : null}
            </text>
          ))}

          {type === "bar"
            ? series.map((s, si) =>
                s.values.map((v, i) => {
                  if (v === null) return null;
                  const x = cx(i) - groupW / 2 + si * (barW + gap);
                  return (
                    <path
                      key={`${s.key}-${i}`}
                      d={barPath(x, barW, y(0), y(v))}
                      fill={years[i].estimate ? `url(#${uid}-hatch-${si})` : COLORS[si]}
                      opacity={active === null || active === i ? 1 : 0.55}
                    />
                  );
                }),
              )
            : series.map((s, si) => (
                <g key={s.key}>
                  {s.values.map((v, i) => {
                    const prev = s.values[i - 1];
                    if (i === 0 || v === null || prev === null || prev === undefined) return null;
                    return (
                      <line
                        key={i}
                        x1={cx(i - 1)}
                        y1={y(prev)}
                        x2={cx(i)}
                        y2={y(v)}
                        stroke={COLORS[si]}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray={years[i].estimate ? "5 4" : undefined}
                      />
                    );
                  })}
                  {s.values.map((v, i) =>
                    v === null ? null : (
                      <g key={i}>
                        <circle cx={cx(i)} cy={y(v)} r="6" fill="#fff" />
                        <circle
                          cx={cx(i)}
                          cy={y(v)}
                          r={active === i ? 5 : 4}
                          fill={years[i].estimate ? "#fff" : COLORS[si]}
                          stroke={COLORS[si]}
                          strokeWidth="2"
                        />
                      </g>
                    ),
                  )}
                </g>
              ))}

          {n === 1
            ? series.map((s) => {
                const i = lastIndex(s.values);
                if (i < 0) return null;
                const v = s.values[i] as number;
                const yy = type === "bar" ? y(v) : y(v) - 4;
                return (
                  <text
                    key={`${s.key}-label`}
                    x={cx(i)}
                    y={v >= 0 ? yy - 6 : y(v) + 14}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill={INK}
                  >
                    {fmt(v)}
                  </text>
                );
              })
            : null}

          {years.map((yr, i) => (
            <rect
              key={`hit-${yr.annee}`}
              x={left + bandW * i}
              y={MARGIN.top}
              width={bandW}
              height={plotH + MARGIN.bottom}
              fill="transparent"
              tabIndex={0}
              aria-label={`${yr.annee}${yr.estimate ? ` (${labels.estimate})` : ""} : ${series
                .map((s) => `${s.label} ${s.values[i] === null ? "–" : fmt(s.values[i] as number)}`)
                .join(", ")}`}
              onPointerEnter={() => setActive(i)}
              onPointerMove={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              style={{ outline: "none", cursor: "default" }}
            />
          ))}
        </svg>

        {active !== null ? (
          <div
            className="pointer-events-none absolute z-10 w-[230px] max-w-full rounded-lg bg-white px-3 py-2 text-[12px] shadow-[0_6px_20px_rgba(13,32,71,0.16)] border border-line"
            style={{ left: tooltipLeft, top: 0 }}
            role="presentation"
          >
            <div className="text-muted mb-1">
              {years[active].annee}
              {years[active].estimate ? ` (${labels.estimate})` : ""}
            </div>
            {series.map((s, si) => (
              <div key={s.key} className="flex items-baseline gap-2 leading-snug py-0.5">
                <span className="inline-block w-3 h-0.5 shrink-0 rounded self-center" style={{ background: COLORS[si] }} />
                <span className="font-semibold text-navy" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {s.values[active] === null ? "–" : fmt(s.values[active] as number)}
                </span>
                <span className="text-muted">{s.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </figure>
  );
}
