import { decode } from "he";

/**
 * Décode toutes les entités HTML (nommées : &eacute; &rsquo; &laquo; ... et
 * numériques : &#233; &#8217; ...) d'un texte issu de l'API WordPress.
 * Point d'entrée unique pour ce décodage — voir lib/wordpress.ts.
 */
export function decodeHtmlEntities(text: string): string {
  return decode(text);
}
