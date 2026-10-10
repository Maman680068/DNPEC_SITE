import { notFound } from "next/navigation";

/**
 * Adresse inconnue : l'application a deux layouts racines ((site) et (admin)),
 * Next ne sait donc pas dans lequel afficher sa page 404 par défaut (anglaise,
 * sans en-tête). Cette route attrape-tout renvoie vers app/(site)/not-found.tsx,
 * affichée avec l'en-tête et le pied du site.
 */
export default function AdresseInconnue() {
  notFound();
}
