"use client";

import { useEffect, useState } from "react";

/** Réapparaît seulement après un vrai défilement (pas dès 8 px). */
const SHOW_AFTER_PX = 320;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Retour en haut de page"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed right-4 sm:right-6 bottom-[5.75rem] z-50 w-11 h-11 rounded-full bg-navy text-white flex items-center justify-center text-lg shadow-[0_4px_14px_rgba(19,43,94,0.35)] cursor-pointer transition-[opacity,transform] duration-300 ease-out ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      ↑
    </button>
  );
}
