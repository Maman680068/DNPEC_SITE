import type { ReactNode } from "react";

/**
 * Trace une ligne horizontale reliant le centre du premier enfant au centre
 * du dernier, avec un embranchement vertical descendant vers chacun.
 * Suppose des enfants de largeur égale (flex-1) : le centre du n-ième
 * élément sur N est à (100/N)*(n-0.5)%, donc la barre horizontale va de
 * 50/N% à 100-50/N% — cf. calcul de `left`/`right` ci-dessous.
 */
export default function Branch<T>({
  items,
  keyOf,
  renderItem,
}: {
  items: T[];
  keyOf: (item: T) => string;
  renderItem: (item: T) => ReactNode;
}) {
  const n = items.length;
  return (
    <div className="relative flex">
      {n > 1 && (
        <div
          className="absolute top-0 h-px bg-navy/25"
          style={{ left: `${50 / n}%`, right: `${50 / n}%` }}
        />
      )}
      {items.map((item) => (
        <div key={keyOf(item)} className="flex-1 min-w-0 flex flex-col items-center px-1.5">
          <div className="w-px h-4 bg-navy/25" />
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
