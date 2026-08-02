"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type SearchResult = { title: string; href: string; type: "Actualité" | "Publication" | "Page" | "RPAE" };

type SearchModalProps = {
  open: boolean;
  onClose: () => void;
};

const SUGGEST_MIN_CHARS = 2;
const DEBOUNCE_MS = 280;

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  const [activeIndex, setActiveIndex] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setResults(null);
      setLoading(false);
      setActiveIndex(-1);
    }
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Suggestions live dès que l'utilisateur tape (debounce).
  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (trimmed.length < SUGGEST_MIN_CHARS) {
      abortRef.current?.abort();
      setResults(null);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const requestId = ++requestIdRef.current;

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (requestId !== requestIdRef.current) return;
        setResults(data.results ?? []);
        setActiveIndex(-1);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (requestId !== requestIdRef.current) return;
        setResults([]);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query, open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    // Si une suggestion est sélectionnée au clavier, y aller directement.
    if (activeIndex >= 0 && results?.[activeIndex]) {
      window.location.href = results[activeIndex].href;
      onClose();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setActiveIndex(-1);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!results?.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    }
  }

  if (!open) return null;

  const showHint = query.trim().length > 0 && query.trim().length < SUGGEST_MIN_CHARS;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-navy-dark/70"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[10px] shadow-2xl w-full max-w-xl p-5 sm:p-8 relative max-h-[calc(100dvh-4rem)] overflow-y-auto"
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

        <h2 className="text-navy text-xl sm:text-2xl font-heading font-semibold mb-1.5 pr-10">Faire une recherche</h2>
        <p className="text-muted text-sm mb-6">Actualités, Documents, Publications, Articles RPAE, etc.</p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Rechercher sur le site..."
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={results !== null}
            aria-controls="search-suggestions"
            className="flex-1 min-w-0 h-12 px-4 rounded-md border border-line bg-paper text-sm text-ink"
          />
          <button
            type="submit"
            disabled={loading && results === null}
            className="bg-red text-white font-bold text-sm px-6 h-12 rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
          >
            {loading && results === null ? "…" : "Rechercher"}
          </button>
        </form>

        {showHint && (
          <p className="mt-3 text-muted text-xs">Tapez au moins {SUGGEST_MIN_CHARS} caractères pour voir des suggestions.</p>
        )}

        {loading && results === null && query.trim().length >= SUGGEST_MIN_CHARS && (
          <p className="mt-4 text-muted text-sm">Recherche en cours…</p>
        )}

        {results !== null && (
          <div id="search-suggestions" role="listbox" className="mt-4 max-h-[360px] overflow-y-auto flex flex-col gap-1">
            {results.length === 0 ? (
              <p className="text-muted text-sm text-center py-6">Aucun résultat trouvé.</p>
            ) : (
              <>
                <p className="text-xs text-muted px-1 mb-1">
                  {results.length} suggestion{results.length > 1 ? "s" : ""}
                </p>
                {results.map((result, index) => (
                  <Link
                    key={`${result.type}-${result.href}`}
                    href={result.href}
                    role="option"
                    aria-selected={index === activeIndex}
                    onClick={onClose}
                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-md transition-colors min-w-0 ${
                      index === activeIndex ? "bg-paper ring-1 ring-yellow" : "hover:bg-paper"
                    }`}
                  >
                    <span className="text-navy text-sm font-medium truncate min-w-0">{result.title}</span>
                    <span className="shrink-0 text-[11px] font-semibold text-green uppercase tracking-wide">
                      {result.type}
                    </span>
                  </Link>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
