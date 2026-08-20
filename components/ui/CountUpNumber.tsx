"use client";

import { useEffect, useRef, useState } from "react";
import { dateLocale } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/use-locale";

type CountUpNumberProps = {
  value: string;
  className?: string;
};

function parseMetric(raw: string): { target: number; decimals: number; prefix: string; suffix: string } {
  const trimmed = raw.trim();
  const match = trimmed.match(/^([^0-9+\-]*)([+\-]?\d+(?:[.,]\d+)?)(.*)$/);
  if (!match) {
    return { target: 0, decimals: 0, prefix: "", suffix: trimmed };
  }
  const [, prefix, numeric, suffix] = match;
  const normalized = numeric.replace(",", ".");
  const decimals = normalized.includes(".") ? (normalized.split(".")[1]?.length ?? 0) : 0;
  return {
    target: Number(normalized),
    decimals,
    prefix,
    suffix,
  };
}

function formatMetric(
  n: number,
  decimals: number,
  prefix: string,
  suffix: string,
  locale: string,
): string {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const sign = n < 0 ? "-" : n > 0 && prefix.includes("+") ? "" : "";
  return `${prefix}${sign}${formatted}${suffix}`;
}

export default function CountUpNumber({ value, className = "" }: CountUpNumberProps) {
  const locale = useLocale();
  const numberLocale = dateLocale(locale);
  const parsed = parseMetric(value);
  const [display, setDisplay] = useState(
    formatMetric(0, parsed.decimals, parsed.prefix, parsed.suffix, numberLocale),
  );
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        observer.disconnect();

        const duration = 1400;
        const start = performance.now();
        const from = 0;
        const { target, decimals, prefix, suffix } = parseMetric(value);

        function tick(now: number) {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          const current = from + (target - from) * eased;
          setDisplay(formatMetric(current, decimals, prefix, suffix, numberLocale));
          if (t < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
