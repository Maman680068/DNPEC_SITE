import { WP_BROWSER_HEADERS } from "@/lib/wordpress-headers";

/**
 * Authentification WordPress (plugin "JWT Authentication for WP REST API")
 * et appels authentifiés pour l'espace contributeurs — séparé de
 * lib/wordpress.ts (lecture publique, non authentifiée, avec repli mock).
 * Ici il n'y a pas de repli mock : soit WordPress répond, soit l'action
 * échoue clairement (on ne peut pas "simuler" une connexion ou une
 * publication).
 */

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL;

/** Racine du site WordPress (avant /wp-json/wp/v2) — pour les routes hors namespace wp/v2 (ex. jwt-auth). */
function wordpressSiteRoot(): string | null {
  if (!WORDPRESS_API_URL) return null;
  return WORDPRESS_API_URL.replace(/\/wp-json\/wp\/v2\/?$/, "");
}

export type WordpressUser = {
  id: number;
  name: string;
  roles: string[];
  /** Droits WordPress effectifs (publish_posts, edit_others_posts…), tels que confirmés par WordPress. */
  capabilities: Record<string, boolean>;
};

export type WordpressLoginResult =
  | { ok: true; token: string; user: WordpressUser }
  | { ok: false; error: string; badCredentials: boolean };

/**
 * Jeton refusé par WordPress : expiré, signature invalide (plugin JWT,
 * codes jwt_auth_*), ou requête traitée comme anonyme (rest_not_logged_in).
 * À distinguer d'un simple manque de droit (rest_cannot_*), qui ne doit pas
 * déconnecter la personne.
 */
export function isSessionRejected(status: number, code: string | undefined): boolean {
  if (code && /^jwt_auth_/.test(code)) return true;
  return status === 401 && (!code || code === "rest_not_logged_in");
}

/**
 * Connexion via le plugin JWT — endpoint hors namespace wp/v2 :
 * POST {racine}/wp-json/jwt-auth/v1/token
 */
export async function loginToWordpress(username: string, password: string): Promise<WordpressLoginResult> {
  const root = wordpressSiteRoot();
  if (!root) {
    return { ok: false, error: "WORDPRESS_API_URL n'est pas configurée sur ce serveur.", badCredentials: false };
  }

  let tokenRes: Response;
  try {
    tokenRes = await fetch(`${root}/wp-json/jwt-auth/v1/token`, {
      method: "POST",
      headers: { ...WP_BROWSER_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: "Impossible de contacter le serveur WordPress.", badCredentials: false };
  }

  const rawBody = await tokenRes.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return {
      ok: false,
      error: "Le serveur WordPress n'a pas répondu en JSON (pare-feu de l'hébergement ?).",
      badCredentials: false,
    };
  }

  if (!tokenRes.ok) {
    // Le plugin JWT répond 403 pour un identifiant ou un mot de passe incorrect.
    const badCredentials = tokenRes.status === 401 || tokenRes.status === 403;
    return {
      ok: false,
      error: badCredentials ? "Identifiant ou mot de passe incorrect." : `Erreur WordPress (HTTP ${tokenRes.status}).`,
      badCredentials,
    };
  }

  const data = parsed as { token?: string };
  if (!data.token) {
    return { ok: false, error: "Réponse WordPress inattendue (jeton absent).", badCredentials: false };
  }

  const user = await fetchWordpressMe(data.token);
  if (!user) {
    return {
      ok: false,
      error: "Connexion réussie mais impossible de récupérer le profil WordPress.",
      badCredentials: false,
    };
  }

  return { ok: true, token: data.token, user };
}

/** GET {WORDPRESS_API_URL}/users/me?context=edit — rôles et droits confirmés par WordPress. */
export async function fetchWordpressMe(token: string): Promise<WordpressUser | null> {
  if (!WORDPRESS_API_URL) return null;
  try {
    const res = await fetch(`${WORDPRESS_API_URL}/users/me?context=edit`, {
      headers: { ...WP_BROWSER_HEADERS, Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const raw = await res.text();
    const data = JSON.parse(raw) as {
      id: number;
      name: string;
      roles?: string[];
      capabilities?: Record<string, boolean>;
    };
    return { id: data.id, name: data.name, roles: data.roles ?? [], capabilities: data.capabilities ?? {} };
  } catch {
    return null;
  }
}

/**
 * Appel authentifié générique vers l'API WordPress (wp/v2/...), pour les
 * actions de l'espace contributeurs (lecture et écriture). Pas de cache :
 * ces appels doivent toujours refléter l'état réel de WordPress.
 */
export async function wordpressAuthedFetch(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<Response> {
  if (!WORDPRESS_API_URL) {
    throw new Error("WORDPRESS_API_URL n'est pas configurée sur ce serveur.");
  }
  return fetch(`${WORDPRESS_API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...WP_BROWSER_HEADERS,
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
}
