import type { NextRequest } from "next/server";

/**
 * Vérification anti-CSRF minimale pour les routes /api/admin/* qui modifient
 * des données : l'Origin (ou à défaut le Referer) de la requête doit
 * correspondre à l'hôte du site. Défense en profondeur — le cookie de
 * session est déjà `sameSite: "lax"` et httpOnly, ceci ajoute une vérification
 * simple sans dépendance supplémentaire (pas de jeton CSRF à générer/stocker).
 */
export function hasTrustedOrigin(request: NextRequest): boolean {
  const host = request.headers.get("host");
  if (!host) return false;

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  // Ni Origin ni Referer : on refuse par prudence (un vrai navigateur envoie
  // toujours au moins l'un des deux pour une requête same-origin en fetch()).
  return false;
}
