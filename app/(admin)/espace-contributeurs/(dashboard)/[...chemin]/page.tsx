import { notFound } from "next/navigation";

/**
 * Adresse inconnue dans l'espace contributeurs : renvoie vers la page 404 de
 * l'espace (not-found.tsx à côté), en français et avec le menu de l'espace,
 * au lieu de la page 404 anglaise par défaut de Next.
 */
export default function AdresseInconnueEspace() {
  notFound();
}
