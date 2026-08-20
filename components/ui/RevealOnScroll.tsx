"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type RevealOnScrollProps = {
  children: ReactNode;
  className?: string;
  /** Décalage en ms une fois l’élément dans le viewport. */
  delayMs?: number;
};

/**
 * Contenu toujours visible par défaut (SSR / JS cassé).
 * L’animation ne masque que brièvement après hydratation si le JS tourne.
 */
export default function RevealOnScroll({ children, className = "", delayMs = 0 }: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"ssr" | "pending" | "done">("ssr");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("done");
      return;
    }

    setPhase("pending");

    const show = () => setPhase("done");

    const revealSoon = (delay: number) => {
      // Double rAF : laisse le paint `pending` (opacity 0) s’appliquer avant `done`.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.setTimeout(show, Math.max(delay, 40));
        });
      });
    };

    const rect = node.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh && rect.bottom > 0) {
      revealSoon(delayMs);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          revealSoon(delayMs);
          observer.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: "0px 0px -24px 0px" },
    );
    observer.observe(node);

    const fallback = window.setTimeout(show, 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, [delayMs]);

  const style: CSSProperties | undefined =
    phase === "done" && delayMs ? { transitionDelay: `${delayMs}ms` } : undefined;

  return (
    <div
      ref={ref}
      style={style}
      data-reveal={phase === "ssr" ? undefined : phase}
      className={`reveal ${phase === "done" ? "is-visible" : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
