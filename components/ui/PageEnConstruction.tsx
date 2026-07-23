import Link from "next/link";

type PageEnConstructionProps = {
  title: string;
  backHref?: string;
};

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
            width="44"
            height="30"
            viewBox="0 0 3 2"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Drapeau de la République de Guinée"
          >
            <rect width="1" height="2" x="0" fill="#CE1126" />
            <rect width="1" height="2" x="1" fill="#FCD116" />
            <rect width="1" height="2" x="2" fill="#009460" />
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
