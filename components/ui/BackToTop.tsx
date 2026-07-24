"use client";

import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 400;
const BASE_MARGIN_PX = 24; // correspond à right-6 / bottom-6
const BUTTON_SIZE_PX = 44; // w-11 / h-11

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(BASE_MARGIN_PX);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX);

      // Repousse le bouton au-dessus du footer dès que celui-ci entre dans
      // le viewport, pour qu'il ne chevauche jamais son texte — quelle que
      // soit la hauteur du footer sur la page courante. Ce calcul ne
      // référence que le footer : le positionnement par défaut (bas à
      // droite du viewport) est totalement indépendant du header sticky.
      // Plafonné pour que le bouton reste toujours entièrement visible à
      // l'écran, même sur un footer plus haut que le viewport (empilement
      // des colonnes en mobile).
      const footer = document.querySelector("footer");
      if (footer) {
        const overlap = window.innerHeight - footer.getBoundingClientRect().top;
        const maxOffset = window.innerHeight - BUTTON_SIZE_PX - BASE_MARGIN_PX;
        const offset = overlap > 0 ? overlap + BASE_MARGIN_PX : BASE_MARGIN_PX;
        setBottomOffset(Math.min(offset, Math.max(maxOffset, BASE_MARGIN_PX)));
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label="Retour en haut de page"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{ bottom: `${bottomOffset}px` }}
      className={`fixed right-6 w-11 h-11 rounded-full bg-green text-white flex items-center justify-center text-lg shadow-[0_4px_14px_rgba(0,0,0,0.25)] cursor-pointer z-50 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      ↑
    </button>
  );
}
