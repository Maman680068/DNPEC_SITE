import type { ReactNode } from "react";
import { ORG_LINE, ConnectorStem } from "./OrgConnector";

/**
 * Barre horizontale + traits verticaux continus vers chaque enfant (sans pointes).
 */
export default function Branch<T>({
  items,
  keyOf,
  renderItem,
  compact = false,
  columnMinWidth,
}: {
  items: T[];
  keyOf: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  compact?: boolean;
  columnMinWidth?: number;
}) {
  const n = items.length;
  const stemH = compact ? 20 : 24;

  return (
    <div className="relative flex w-full isolate">
      {n > 1 && (
        <div
          className={`absolute top-0 h-[2px] ${ORG_LINE}`}
          style={{ left: `${50 / n}%`, right: `${50 / n}%` }}
        />
      )}
      {items.map((item) => (
        <div
          key={keyOf(item)}
          className="flex-1 flex flex-col items-center px-0.5 min-w-0"
          style={columnMinWidth ? { minWidth: columnMinWidth } : undefined}
        >
          {/* Chevauche d’1 px la barre horizontale pour éviter les coupures visuelles */}
          <ConnectorStem height={stemH} />
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
