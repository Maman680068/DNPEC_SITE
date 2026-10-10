/**
 * Constantes partagées entre `middleware.ts` (edge, aucune API Node) et le
 * reste de l'espace contributeurs — d'où ce fichier séparé sans import
 * `next/headers` ni autre API serveur uniquement.
 */

export const ADMIN_BASE_PATH = "/espace-contributeurs";
export const ADMIN_LOGIN_PATH = "/espace-contributeurs/connexion";
export const ADMIN_SESSION_COOKIE = "dnpec_session";
/**
 * Témoin sans contenu, posé à la connexion pour 30 jours : quand le cookie de
 * session disparaît (il expire avec le jeton JWT), il permet d'afficher
 * « Session expirée » au lieu d'une page de connexion muette.
 */
export const ADMIN_SESSION_HINT_COOKIE = "dnpec_session_active";
/** Efface une session refusée par WordPress puis renvoie à la connexion (voir la route correspondante). */
export const ADMIN_SESSION_EXPIRED_PATH = "/espace-contributeurs/session-expiree";
export const SESSION_EXPIRED_MESSAGE = "Session expirée, reconnectez-vous.";

/**
 * Destination après connexion (?next=) : uniquement un chemin interne de
 * l'espace contributeurs. Refuse « //site », « http:… », « \… » et la page de
 * connexion elle-même, pour qu'un lien piégé ne renvoie pas vers un autre site.
 */
export function safeNextPath(value: string | null | undefined): string {
  if (!value) return ADMIN_BASE_PATH;
  if (!/^\/espace-contributeurs(?:[/?#]|$)/.test(value)) return ADMIN_BASE_PATH;
  if (value.includes("//") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) return ADMIN_BASE_PATH;
  if (value.startsWith(ADMIN_LOGIN_PATH) || value.startsWith(ADMIN_SESSION_EXPIRED_PATH)) return ADMIN_BASE_PATH;
  return value;
}

/** Rôles WordPress natifs autorisés à publier directement (sans validation). */
export const DIRECT_PUBLISH_ROLES = ["administrator", "editor", "author"];

export function canPublishDirectly(roles: string[]): boolean {
  return roles.some((role) => DIRECT_PUBLISH_ROLES.includes(role));
}

/**
 * Rôles qui peuvent modérer (publier ou rejeter) le contenu des autres :
 * administrateur et éditeur. Un Auteur publie ses propres contenus mais ne
 * peut pas modifier ceux des autres — on ne lui montre donc pas ces boutons.
 * Affichage seulement : chaque action est revérifiée auprès de WordPress.
 */
export const MODERATOR_ROLES = ["administrator", "editor"];

export function canModerate(roles: string[]): boolean {
  return roles.some((role) => MODERATOR_ROLES.includes(role));
}

export function isAdministrator(roles: string[]): boolean {
  return roles.includes("administrator");
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

/** Identifiant WordPress dans une adresse de l'espace : chiffres uniquement, sinon 404. */
export function isNumericId(id: string): boolean {
  return /^\d{1,18}$/.test(id);
}
