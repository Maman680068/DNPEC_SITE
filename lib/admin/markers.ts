/**
 * Marqueurs de rejet ajoutés au contenu WordPress (commentaires HTML, jamais
 * affichés : le site public retire les commentaires — voir lib/sanitizeHtml.ts).
 * Un contenu rejeté est un brouillon portant ce marqueur ; « Publier » le retire.
 */

/** Actualité rejetée depuis l'espace contributeurs. */
export const ACTUALITE_REJECT_MARKER = "<!-- dnpec:statut rejete -->";

/** Article RPAE refusé (convention du comité, voir lib/rpae.ts et docs/RPAE-WORDPRESS.md). */
export const RPAE_REFUSE_MARKER = "<!-- rpae:statut-soumission refuse -->";

const ACTUALITE_REJECT_RE = /<!--\s*dnpec:statut\s+rejete\s*-->/i;
const RPAE_REFUSE_RE = /<!--\s*rpae:statut-soumission\s+refuse\s*-->/i;

export function isRejectedActualite(content: string): boolean {
  return ACTUALITE_REJECT_RE.test(content);
}

export function isRefusedRpae(content: string): boolean {
  return RPAE_REFUSE_RE.test(content);
}

export function withoutRejectMarkers(content: string): string {
  return content
    .replace(new RegExp(`\\n?${ACTUALITE_REJECT_RE.source}`, "gi"), "")
    .replace(new RegExp(`\\n?${RPAE_REFUSE_RE.source}`, "gi"), "");
}
