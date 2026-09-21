/**
 * En-têtes imitant un navigateur, requis par le pare-feu de l'hébergement
 * WordPress (voir lib/wordpress.ts) — partagés avec l'espace contributeurs
 * (lib/admin/wordpress-auth.ts) qui parle au même WordPress.
 */
export const WP_BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json",
};
