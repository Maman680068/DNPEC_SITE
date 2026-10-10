import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

/** Page introuvable dans l'espace contributeurs (adresse inconnue, identifiant invalide ou contenu supprimé). */
export default function EspaceIntrouvable() {
  return (
    <div className="max-w-xl">
      <p className="text-green font-semibold text-xs uppercase tracking-wide">Erreur 404</p>
      <h1 className="mt-1 text-2xl text-navy font-heading font-semibold">Page introuvable</h1>
      <p className="mt-3 text-[14px] text-muted">
        Cette page n&apos;existe pas, ou le contenu demandé a été supprimé. Vérifiez l&apos;adresse ou revenez à
        l&apos;accueil de l&apos;espace contributeurs.
      </p>
      <Link
        href="/espace-contributeurs"
        className="mt-6 inline-flex items-center justify-center bg-navy text-white font-bold text-sm px-5 h-10 rounded-lg hover:bg-navy-dark"
      >
        Retour à l&apos;accueil de l&apos;espace
      </Link>
    </div>
  );
}
