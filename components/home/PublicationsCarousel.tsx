"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PublicationCard } from "@/lib/types";

const ACCENT_CLASSES = ["bg-green", "bg-yellow"];
const AUTOPLAY_MS = 6000;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (!iso || Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

type PublicationsCarouselProps = {
  publications: PublicationCard[];
};

export default function PublicationsCarousel({ publications }: PublicationsCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failedThumbs, setFailedThumbs] = useState<Set<string>>(new Set());
  const count = publications.length;

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count, paused]);

  if (count === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-white/25 text-[#c3cee0] text-[13px] text-center p-5">
        Aucune publication disponible pour le moment.
      </div>
    );
  }

  const current = publications[index];
  const accent = ACCENT_CLASSES[index % ACCENT_CLASSES.length];
  const showThumbnail = !!current.pdfUrl && !failedThumbs.has(current.slug);

  return (
    <div
      className="relative rounded-lg overflow-hidden h-full min-h-[330px] bg-gradient-to-br from-navy-dark to-navy"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {showThumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={current.slug}
          src={`/api/pdf-thumbnail?url=${encodeURIComponent(current.pdfUrl!)}`}
          alt=""
          className="absolute inset-0 z-0 w-full h-full object-cover object-top"
          onError={() => setFailedThumbs((prev) => new Set(prev).add(current.slug))}
        />
      )}

      <div className={`absolute top-0 left-0 right-0 h-1.5 z-20 ${accent}`} />

      {showThumbnail && (
        // Voile uniforme : garantit un contraste suffisant pour le texte blanc
        // quel que soit le contenu (couleurs, clarté) de la première page du PDF.
        <div className="absolute inset-0 z-10 bg-black/40 pointer-events-none" />
      )}

      {/* Overlay bas, plus marqué, pour la lisibilité du titre/bouton */}
      <div className="absolute inset-x-0 bottom-0 z-10 h-2/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      <div className="absolute inset-0 z-20 flex flex-col px-14 py-5 sm:px-20 sm:py-7">
        <div className="flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/logo-dnpec-clean.png" alt="" className="h-8 sm:h-9 w-auto opacity-90" />
          <span className="text-[11.5px] text-[#c3cee0] font-medium">{formatDate(current.date)}</span>
        </div>

        <div className="mt-auto">
          <h3 className="text-white text-base sm:text-2xl font-heading font-semibold leading-snug mb-3 sm:mb-4 line-clamp-3">
            {current.title}
          </h3>
          <Link
            href={current.href}
            className="inline-flex items-center justify-center bg-yellow text-navy-dark font-bold text-sm px-6 h-11 rounded-lg hover:brightness-95 transition-[filter]"
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
                  onClick={() => setIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? "bg-yellow" : "bg-white/30"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {count > 1 && (
        <div className="absolute top-1/2 left-0 right-0 z-30 flex justify-between px-3 -translate-y-1/2">
          <button
            type="button"
            aria-label="Publication précédente"
            onClick={() => setIndex((i) => (i - 1 + count) % count)}
            className="w-[38px] h-[38px] rounded-full bg-white/15 border border-white/30 text-white flex items-center justify-center text-base cursor-pointer hover:bg-white/25 transition-colors"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Publication suivante"
            onClick={() => setIndex((i) => (i + 1) % count)}
            className="w-[38px] h-[38px] rounded-full bg-white/15 border border-white/30 text-white flex items-center justify-center text-base cursor-pointer hover:bg-white/25 transition-colors"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
