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

type HeroProps = {
  publications: PublicationCard[];
};

export default function Hero({ publications }: HeroProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = publications.length;

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count, paused]);

  // Rien à montrer (aucune page "Documents conjoncturels" publiée pour
  // l'instant) : on masque entièrement la bannière plutôt que d'afficher un
  // bloc vide en tout premier sur la page d'accueil.
  if (count === 0) return null;

  const current = publications[index];

  // Les contrôles (flèches, points) sont imbriqués dans le Link de la carte
  // entière — on empêche la navigation du Link pour ne faire que changer de
  // diapositive.
  function goTo(i: number, event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    setIndex(i);
  }

  return (
    <Link
      href={current.href}
      className="hero-slider relative rounded-[10px] overflow-hidden min-h-[280px] sm:min-h-[340px] h-auto mb-11 block"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative z-10 px-5 pt-8 pb-16 sm:absolute sm:left-9 sm:bottom-8 sm:right-9 sm:p-0 text-white">
        <span className="inline-block bg-yellow text-navy-dark text-[11.5px] font-bold px-3 py-1.5 rounded mb-3.5">
          CONJONCTURE
        </span>
        <h2 className="text-xl sm:text-[26px] max-w-[640px] leading-snug text-white font-semibold line-clamp-4 sm:line-clamp-3">
          {current.title}
        </h2>
        <div className="text-[12.5px] text-[#c3cee0] mt-2.5">{formatDate(current.date)}</div>

        {count > 1 && (
          <div className="flex gap-1.5 mt-4">
            {publications.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                aria-label={`Aller à la publication ${i + 1}`}
                aria-current={i === index}
                onClick={(event) => goTo(i, event)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? "bg-yellow" : "bg-white/30"}`}
              />
            ))}
          </div>
        )}
      </div>

      {count > 1 && (
        <div className="absolute bottom-4 right-4 sm:top-1/2 sm:left-0 sm:right-0 sm:bottom-auto sm:flex sm:justify-between sm:px-[18px] sm:-translate-y-1/2 z-20 flex gap-2 sm:gap-0">
          <button
            type="button"
            aria-label="Publication précédente"
            onClick={(event) => goTo((index - 1 + count) % count, event)}
            className="w-8 h-8 sm:w-[38px] sm:h-[38px] rounded-full bg-white/15 border border-white/30 text-white flex items-center justify-center text-base cursor-pointer hover:bg-white/25 transition-colors"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Publication suivante"
            onClick={(event) => goTo((index + 1) % count, event)}
            className="w-8 h-8 sm:w-[38px] sm:h-[38px] rounded-full bg-white/15 border border-white/30 text-white flex items-center justify-center text-base cursor-pointer hover:bg-white/25 transition-colors"
          >
            ›
          </button>
        </div>
      )}
    </Link>
  );
}
