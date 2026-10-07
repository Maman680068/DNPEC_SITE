import { redirect } from "next/navigation";
import { ADMIN_SESSION_EXPIRED_PATH } from "./constants";
import type { AdminResult } from "./data";

/**
 * Pour une page de l'espace contributeurs : jeton expiré ou refusé → renvoi
 * vers la connexion (« Session expirée, reconnectez-vous ») ; autre erreur
 * WordPress → message affiché par la page (jamais une liste vide trompeuse).
 */
export function readAdminResult<T>(result: AdminResult<T>): { data: T; error: null } | { data: null; error: string } {
  if (result.ok) return { data: result.data, error: null };
  if (result.expired) redirect(ADMIN_SESSION_EXPIRED_PATH);
  return { data: null, error: result.error };
}
