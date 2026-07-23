import Link from "next/link";
import type { CSSProperties } from "react";

type PageEnConstructionProps = {
  title: string;
  backHref?: string;
};

/**
 * Bandes du drapeau guinéen (rouge/jaune/vert), subdivisées en 2 par
 * couleur pour permettre un léger décalage de phase entre bandes et
 * simuler un flottement au vent en CSS pur (voir .flag-band / @keyframes
 * flag-wave dans globals.css). L'amplitude croît de gauche (hampe) à
 * droite (bord libre), comme sur un vrai drapeau qui flotte.
 */
const FLAG_BANDS: { x: number; color: string; delay: string; amp: string }[] = [
  { x: 0, color: "#CE1126", delay: "0s", amp: "1.2deg" },
  { x: 0.5, color: "#CE1126", delay: "0.12s", amp: "1.6deg" },
  { x: 1, color: "#FCD116", delay: "0.24s", amp: "2deg" },
  { x: 1.5, color: "#FCD116", delay: "0.36s", amp: "2.4deg" },
  { x: 2, color: "#009460", delay: "0.48s", amp: "2.8deg" },
  { x: 2.5, color: "#009460", delay: "0.6s", amp: "3.2deg" },
];

export default function PageEnConstruction({ title, backHref = "/" }: PageEnConstructionProps) {
  return (
    <div className="wrap flex items-center justify-center min-h-[60vh] py-20">
      <div className="max-w-lg w-full flex flex-col items-center text-center gap-5">
        <div className="w-16 h-16 rounded-full bg-navy text-yellow flex items-center justify-center shrink-0">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3.5 2" />
          </svg>
        </div>

        <div className="rounded-sm overflow-hidden shadow-sm">
          <svg
            width="56"
            height="37"
            viewBox="0 0 3 2"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Drapeau de la République de Guinée"
          >
            {FLAG_BANDS.map((band, index) => (
              <rect
                key={index}
                x={band.x}
                y="0"
                width="0.54"
                height="2"
                fill={band.color}
                className="flag-band"
                style={
                  {
                    "--flag-delay": band.delay,
                    "--flag-amp": band.amp,
                  } as CSSProperties
                }
              />
            ))}
          </svg>
        </div>

        <h1 className="font-heading text-2xl md:text-[28px] text-navy font-semibold">{title}</h1>

        <p className="text-[15px] text-muted leading-relaxed">
          Cette page est en cours de construction.
        </p>

        <p className="text-xs text-muted uppercase tracking-wide">
          Direction Nationale des Prévisions Économiques et de la Conjoncture
        </p>

        <Link
          href={backHref}
          className="mt-2 inline-flex items-center justify-center bg-yellow text-navy-dark font-bold text-sm px-7 h-12 rounded-lg hover:brightness-95 transition-[filter]"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
