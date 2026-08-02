"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PublicationCard } from "@/lib/types";

const AUTOPLAY_MS = 6000;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (!iso || Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

/** Texte filigrane dérivé du titre (majuscules, sans accents). */
function watermarkFromTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[()]/g, "")
    .toUpperCase()
    .trim();
}

type HeroProps = {
  publications: PublicationCard[];
};

export default function Hero({ publications }: HeroProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failedThumbs, setFailedThumbs] = useState<Set<string>>(new Set());
  const count = publications.length;

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count, paused]);

  if (count === 0) return null;

  const current = publications[index];
  const watermark = watermarkFromTitle(current.title);
  // Première page du PDF (comme l'exemple REF) — sinon image de couverture WP.
  const usePdfThumb = !!current.pdfUrl && !failedThumbs.has(current.slug);
  const previewSrc = usePdfThumb
    ? `/api/pdf-thumbnail?url=${encodeURIComponent(current.pdfUrl!)}`
    : current.coverImage;

  function goTo(i: number, event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    setIndex(i);
  }

  function PreviewImage({ className }: { className?: string }) {
    if (!previewSrc) {
      return (
        <div className={`flex items-center justify-center bg-[#e8ecf2] text-muted text-sm p-6 text-center ${className ?? ""}`}>
          Aperçu du document indisponible
        </div>
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={current.slug}
        src={previewSrc}
        alt={`Première page — ${current.title}`}
        className={className}
        onError={() => {
          if (usePdfThumb) setFailedThumbs((prev) => new Set(prev).add(current.slug));
        }}
      />
    );
  }

  return (
    <section
      className="hero-slider relative rounded-[10px] overflow-hidden mb-11 border-[3px] border-navy-dark"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] min-h-[320px] sm:min-h-[380px] bg-[#d8dde6]">
        <div className="relative z-10 flex flex-col px-5 pt-5 pb-14 sm:px-8 sm:pt-6 sm:pb-16 lg:pr-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/armoiries-guinee.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-6 w-[200px] sm:w-[260px] -translate-x-1/2 opacity-[0.35] select-none"
          />

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white shadow-sm shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/logo-dnpec-clean.png" alt="" className="w-full h-full object-contain p-0.5" />
            </div>
            <div className="text-[12px] sm:text-[13px] text-[#8a93a3] font-medium pt-1">
              {formatDate(current.date)}
            </div>
          </div>

          <div className="relative z-10 mt-8 sm:mt-12 max-w-[420px]">
            <div className="text-[13px] sm:text-[15px] font-bold text-ink leading-snug">
              Ministère de l&apos;Économie et des Finances
            </div>
            <div className="mt-2 h-[5px] w-[120px] rounded-sm overflow-hidden flex">
              <span className="flex-1 bg-red" />
              <span className="flex-1 bg-yellow" />
              <span className="flex-1 bg-green" />
            </div>

            <div className="relative mt-5 sm:mt-6 rounded-md px-1 py-1">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-1 -top-4 text-[26px] sm:text-[38px] leading-[0.95] font-heading font-bold text-navy-dark/25 select-none max-w-[300px] sm:max-w-[360px] line-clamp-3 tracking-tight"
              >
                {watermark}
              </div>
              <h2 className="relative text-[22px] sm:text-[28px] lg:text-[30px] font-heading font-bold text-white leading-tight [text-shadow:0_2px_8px_rgba(13,32,71,0.55),0_0_2px_rgba(13,32,71,0.8)] line-clamp-3">
                {current.title}
              </h2>
            </div>

            <Link
              href={current.href}
              className="inline-flex items-center justify-center mt-5 sm:mt-6 bg-yellow text-navy-dark font-bold text-sm px-6 h-11 rounded-lg hover:brightness-95 transition-[filter]"
            >
              Lire la suite
            </Link>

            {count > 1 && (
              <div className="flex gap-1.5 mt-5">
                {publications.map((p, i) => (
                  <button
                    key={p.slug}
                    type="button"
                    aria-label={`Aller à la publication ${i + 1}`}
                    aria-current={i === index}
                    onClick={(event) => goTo(i, event)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? "bg-yellow" : "bg-navy/25"}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Première page du document — cadre incliné (style exemple REF) */}
        <div className="relative hidden lg:block min-h-[380px]">
          <div className="absolute inset-y-6 right-6 left-2">
            <div className="absolute inset-0 translate-x-2 translate-y-2 bg-navy-dark rounded-sm rotate-[-6deg]" />
            <div className="absolute inset-0 overflow-hidden rounded-sm rotate-[-6deg] shadow-xl border-[3px] border-navy-dark bg-white">
              <PreviewImage className="w-full h-full object-cover object-top" />
            </div>
          </div>
        </div>

        <div className="lg:hidden relative h-[220px] mx-5 mb-5 -mt-2 rounded-md overflow-hidden border-2 border-navy-dark bg-white">
          <PreviewImage className="w-full h-full object-cover object-top" />
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Publication précédente"
              onClick={(event) => goTo((index - 1 + count) % count, event)}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-full bg-navy-dark/45 border border-white/35 text-white flex items-center justify-center text-base cursor-pointer hover:bg-navy-dark/65 transition-colors"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Publication suivante"
              onClick={(event) => goTo((index + 1) % count, event)}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-full bg-navy-dark/55 border border-white/40 text-white flex items-center justify-center text-base cursor-pointer hover:bg-navy-dark/75 transition-colors"
            >
              ›
            </button>
          </>
        )}
      </div>
    </section>
  );
}
