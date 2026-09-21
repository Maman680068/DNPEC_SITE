"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AdminRpaeListItem } from "@/lib/admin/rpae";
import { RPAE_USAGE_LABELS } from "@/lib/rpae";

type TabKey = "pending" | "publish" | "draft";

const TABS: { key: TabKey; label: string }[] = [
  { key: "pending", label: "En attente de relecture" },
  { key: "publish", label: "Publiés" },
  { key: "draft", label: "Rejetés" },
];

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function RpaeDashboard({ items }: { items: AdminRpaeListItem[] }) {
  const [active, setActive] = useState<TabKey>("pending");

  const counts = useMemo(() => {
    const result: Record<TabKey, number> = { pending: 0, publish: 0, draft: 0 };
    for (const item of items) {
      if (item.status in result) result[item.status as TabKey] += 1;
    }
    return result;
  }, [items]);

  const filtered = items.filter((item) => item.status === active);

  return (
    <div>
      <div role="tablist" className="flex flex-wrap gap-1 mb-6 border-b border-line pb-0">
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.key)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-md transition-colors cursor-pointer ${
                isActive ? "bg-navy text-white" : "bg-transparent text-navy/70 hover:text-navy hover:bg-navy/[0.06]"
              }`}
            >
              {tab.label} ({counts[tab.key]})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted text-sm">Aucun article dans cette catégorie pour le moment.</p>
      ) : (
        <div className="bg-white rounded-lg border border-line divide-y divide-line">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/espace-contributeurs/revue-scientifique/${item.id}`}
              className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-navy/[0.02] transition-colors"
            >
              <div className="min-w-0">
                <p className="text-navy font-semibold text-[15px]">{item.title || "(sans titre)"}</p>
                <p className="text-muted text-[13px] mt-1">
                  {item.auteur} · {item.profilLabel} · {item.theme}
                  {item.editionAnnee ? ` · ${item.editionAnnee}` : ""} · {formatDate(item.date)}
                </p>
              </div>
              <span className="shrink-0 text-[11.5px] font-semibold text-navy/70 bg-navy/[0.06] px-2.5 py-1 rounded-full">
                {RPAE_USAGE_LABELS[item.usage] ?? item.usage}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
