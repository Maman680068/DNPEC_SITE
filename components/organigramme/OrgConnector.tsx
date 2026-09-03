/** Ligne verticale simple (sans pointe de flèche). */
export function ConnectorDown({ height = 28 }: { height?: number }) {
  return (
    <div
      className="w-[2px] shrink-0 bg-navy/60"
      style={{ height }}
      aria-hidden="true"
    />
  );
}

/** Séparation avant le bandeau CE — trait vertical uniquement. */
export function ConnectorChevron() {
  return (
    <div className="flex flex-col items-center my-1" aria-hidden="true">
      <div className="w-[2px] h-5 bg-navy/60" />
    </div>
  );
}

export const ORG_LINE = "bg-navy/60";

/** Trait vertical d’embranchement — hauteur fixe, jointure continue avec la barre horizontale. */
export function ConnectorStem({ height = 24 }: { height?: number }) {
  return <div className={`w-[2px] shrink-0 ${ORG_LINE}`} style={{ height }} aria-hidden="true" />;
}
