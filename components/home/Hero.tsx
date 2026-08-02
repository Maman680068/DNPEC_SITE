"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PublicationCard } from "@/lib/types";

const AUTOPLAY_MS = 5000;

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
  const [failedThumbs, setFailedThumbs] = useState<Set<string>>(new Set());
  const count = publications.length;

  // Défilement automatique — ne s'arrête pas au survol (sinon on croit que ça ne marche pas).
  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count]);

  if (count === 0) return null;

  const current = publications[index];
  const watermark = watermarkFromTitle(current.title);
  const usePdfThumb = !!current.pdfUrl && !failedThumbs.has(current.slug);
  const previewSrc = usePdfThumb
    ? `/api/pdf-thumbnail?url=${encodeURIComponent(current.pdfUrl!)}`
    : current.coverImage;

  function goTo(i: number, event?: React.MouseEvent) {
    event?.preventDefault();
    event?.stopPropagation();
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
    <section className="hero-slider relative rounded-[10px] overflow-hidden mb-11 border-[3px] border-navy-dark">
      <div className="relative grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] min-h-[320px] sm:min-h-[380px] bg-[#d8dde6]">
        <div className="relative z-10 flex flex-col px-5 pt-5 pb-14 sm:px-8 sm:pt-6 sm:pb-16 lg:pr-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/armoiries-guinee.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-6 w-[180px] sm:w-[220px] -translate-x-1/2 opacity-20 select-none"
          />

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white shadow-sm shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/logo-dnpec-clean.png" alt="" className="w-full h-full object-contain p-0.5" />
            </div>
            <div className="text-[12px] sm:text-[13px] text-[#5b6270] font-medium pt-1">
              {formatDate(current.date)}
            </div>
          </div>

          <div className="relative z-10 mt-8 sm:mt-12 max-w-[440px]">
            <div className="text-[13px] sm:text-[15px] font-bold text-ink leading-snug">
              Ministère de l&apos;Économie et des Finances
            </div>
            <div className="mt-2 h-[5px] w-[120px] rounded-sm overflow-hidden flex">
              <span className="flex-1 bg-red" />
              <span className="flex-1 bg-yellow" />
              <span className="flex-1 bg-green" />
            </div>

            <div key={current.slug} className="relative mt-5 sm:mt-6 hero-fade">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-0.5 -top-3 text-[22px] sm:text-[32px] leading-[0.95] font-heading font-bold text-navy-dark/10 select-none max-w-[320px] line-clamp-3 tracking-tight"
              >
                {watermark}
              </div>
              <h2 className="relative text-[22px] sm:text-[28px] lg:text-[30px] font-heading font-bold text-navy-dark leading-tight line-clamp-3">
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
              <div className="flex gap-2 mt-5" role="tablist" aria-label="Diapositives du carrousel">
                {publications.map((p, i) => (
                  <button
                    key={p.slug}
                    type="button"
                    role="tab"
                    aria-label={`Aller à la publication ${i + 1}`}
                    aria-selected={i === index}
                    onClick={(event) => goTo(i, event)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? "w-6 bg-yellow" : "w-1.5 bg-navy/30 hover:bg-navy/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative hidden lg:block min-h-[380px]">
          <div className="absolute inset-y-6 right-6 left-2">
            <div className="absolute inset-0 translate-x-2 translate-y-2 bg-navy-dark rounded-sm rotate-[-6deg]" />
            <div
              key={current.slug}
              className="absolute inset-0 overflow-hidden rounded-sm rotate-[-6deg] shadow-xl border-[3px] border-navy-dark bg-white hero-fade"
            >
              <PreviewImage className="w-full h-full object-cover object-top" />
            </div>
          </div>
        </div>

        <div
          key={`mobile-${current.slug}`}
          className="lg:hidden relative h-[220px] mx-5 mb-5 -mt-2 rounded-md overflow-hidden border-2 border-navy-dark bg-white hero-fade"
        >
          <PreviewImage className="w-full h-full object-cover object-top" />
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Publication précédente"
              onClick={() => goTo((index - 1 + count) % count)}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-full bg-navy-dark/55 border border-white/40 text-white flex items-center justify-center text-base cursor-pointer hover:bg-navy-dark/75 transition-colors"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Publication suivante"
              onClick={() => goTo((index + 1) % count)}
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
