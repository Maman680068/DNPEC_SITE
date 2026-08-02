"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SearchResult = { title: string; href: string; type: "Actualité" | "Publication" | "Page" };

type SearchModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  // Réinitialise le champ et les résultats à chaque (ré)ouverture, sans passer
  // par un effet (évite le rendu en cascade signalé par react-hooks/set-state-in-effect).
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setResults(null);
    }
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-navy-dark/70"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[10px] shadow-2xl w-full max-w-xl p-8 relative"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Fermer la recherche"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-navy hover:bg-paper transition-colors cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-navy text-2xl font-heading font-semibold mb-1.5">Faire une recherche</h2>
        <p className="text-muted text-sm mb-6">Actualités, Documents, Publications, Articles RPAE, etc.</p>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher sur le site..."
            className="flex-1 h-12 px-4 rounded-md border border-line bg-paper text-sm text-ink"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-red text-white font-bold text-sm px-6 rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "…" : "Rechercher"}
          </button>
        </form>

        {results !== null && (
          <div className="mt-6 max-h-[360px] overflow-y-auto flex flex-col gap-1.5">
            {results.length === 0 ? (
              <p className="text-muted text-sm text-center py-6">Aucun résultat trouvé.</p>
            ) : (
              results.map((result) => (
                <Link
                  key={`${result.type}-${result.href}`}
                  href={result.href}
                  onClick={onClose}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-md hover:bg-paper transition-colors"
                >
                  <span className="text-navy text-sm font-medium">{result.title}</span>
                  <span className="shrink-0 text-[11px] font-semibold text-green uppercase tracking-wide">
                    {result.type}
                  </span>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
