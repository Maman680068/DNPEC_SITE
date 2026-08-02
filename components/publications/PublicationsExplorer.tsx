"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Publication } from "@/lib/types";
import { publicationTypes } from "@/lib/mock-data";

type PublicationsExplorerProps = {
  publications: Publication[];
  initialType?: string;
};

export default function PublicationsExplorer({
  publications,
  initialType = "",
}: PublicationsExplorerProps) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState(initialType);
  const [year, setYear] = useState("");

  const years = useMemo(
    () => Array.from(new Set(publications.map((p) => p.year))).sort((a, b) => b - a),
    [publications],
  );

  const filtered = publications.filter((publication) => {
    const matchesSearch = publication.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = !type || publication.type === type;
    const matchesYear = !year || publication.year === Number(year);
    return matchesSearch && matchesType && matchesYear;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-8 bg-white rounded-lg border border-line p-4">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher une publication..."
          className="flex-1 min-w-0 w-full h-11 px-4 rounded-md border border-line bg-paper text-sm"
        />
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="h-11 px-3 rounded-md border border-line bg-paper text-sm w-full sm:w-auto min-w-0 sm:min-w-[10rem]"
        >
          <option value="">Tous les types</option>
          {publicationTypes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(event) => setYear(event.target.value)}
          className="h-11 px-3 rounded-md border border-line bg-paper text-sm w-full sm:w-auto min-w-0 sm:min-w-[8rem]"
        >
          <option value="">Toutes les années</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted text-sm">Aucune publication ne correspond à ces critères.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px]">
          {filtered.map((publication) => (
            <Link
              key={publication.id}
              href={`/publications/${publication.slug}`}
              className="bg-white rounded-[10px] p-6.5 shadow-[0_8px_24px_rgba(13,32,71,0.08)] block"
            >
              <div className="w-[34px] h-1.5 bg-green rounded-[3px] mb-4" />
              <h3 className="text-[17px] text-navy mb-2.5">{publication.title}</h3>
              <p className="text-[13px] text-muted leading-relaxed mb-3">{publication.description}</p>
              <span className="text-xs text-muted">{publication.year}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
