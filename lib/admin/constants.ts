/**
 * Constantes partagées entre `middleware.ts` (edge, aucune API Node) et le
 * reste de l'espace contributeurs — d'où ce fichier séparé sans import
 * `next/headers` ni autre API serveur uniquement.
 */

export const ADMIN_BASE_PATH = "/espace-contributeurs";
export const ADMIN_LOGIN_PATH = "/espace-contributeurs/connexion";
export const ADMIN_SESSION_COOKIE = "dnpec_session";

/** Rôles WordPress natifs autorisés à publier directement (sans validation). */
export const DIRECT_PUBLISH_ROLES = ["administrator", "editor", "author"];

export function canPublishDirectly(roles: string[]): boolean {
  return roles.some((role) => DIRECT_PUBLISH_ROLES.includes(role));
}

const ROLE_LABELS_FR: Record<string, string> = {
  administrator: "Administrateur",
  editor: "Rédacteur en chef",
  author: "Auteur",
  contributor: "Contributeur",
  subscriber: "Abonné",
};

/** Libellé français lisible pour l'affichage (jamais le terme WordPress brut). */
export function roleLabel(roles: string[]): string {
  const known = roles.find((role) => ROLE_LABELS_FR[role]);
  if (known) return ROLE_LABELS_FR[known];
  return roles[0] ?? "Compte";
}
