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
};

export type WordpressLoginResult =
  | { ok: true; token: string; user: WordpressUser }
  | { ok: false; error: string };

/**
 * Connexion via le plugin JWT — endpoint hors namespace wp/v2 :
 * POST {racine}/wp-json/jwt-auth/v1/token
 */
export async function loginToWordpress(username: string, password: string): Promise<WordpressLoginResult> {
  const root = wordpressSiteRoot();
  if (!root) {
    return { ok: false, error: "WORDPRESS_API_URL n'est pas configurée sur ce serveur." };
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
    return { ok: false, error: "Impossible de contacter le serveur WordPress." };
  }

  const rawBody = await tokenRes.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return {
      ok: false,
      error:
        "Le serveur WordPress n'a pas répondu en JSON (probablement le pare-feu de l'hébergement — voir diagnostic en cours).",
    };
  }

  if (!tokenRes.ok) {
    const message =
      (parsed as { message?: string } | null)?.message ?? "Identifiant ou mot de passe incorrect.";
    return { ok: false, error: stripHtmlTags(message) };
  }

  const data = parsed as { token?: string };
  if (!data.token) {
    return { ok: false, error: "Réponse WordPress inattendue (jeton absent)." };
  }

  const user = await fetchWordpressMe(data.token);
  if (!user) {
    return { ok: false, error: "Connexion réussie mais impossible de récupérer le profil WordPress." };
  }

  return { ok: true, token: data.token, user };
}

/** GET {WORDPRESS_API_URL}/users/me?context=edit — nécessite le jeton du plugin JWT. */
export async function fetchWordpressMe(token: string): Promise<WordpressUser | null> {
  if (!WORDPRESS_API_URL) return null;
  try {
    const res = await fetch(`${WORDPRESS_API_URL}/users/me?context=edit`, {
      headers: { ...WP_BROWSER_HEADERS, Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const raw = await res.text();
    const data = JSON.parse(raw) as { id: number; name: string; roles?: string[] };
    return { id: data.id, name: data.name, roles: data.roles ?? [] };
  } catch {
    return null;
  }
}

function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
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
