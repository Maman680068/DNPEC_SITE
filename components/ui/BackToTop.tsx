"use client";

export default function BackToTop() {
  return (
    <button
      type="button"
      aria-label="Retour en haut de page"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed right-6 bottom-6 w-11 h-11 rounded-full bg-green text-white flex items-center justify-center text-lg shadow-[0_4px_14px_rgba(0,0,0,0.25)] cursor-pointer z-50"
    >
      ↑
    </button>
  );
}
