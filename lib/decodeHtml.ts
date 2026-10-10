import { decode } from "he";

/**
 * Décode toutes les entités HTML (nommées : &eacute; &rsquo; &laquo; ... et
 * numériques : &#233; &#8217; ...) d'un texte issu de l'API WordPress.
 * Point d'entrée unique pour ce décodage — voir lib/wordpress.ts.
 */
export function decodeHtmlEntities(text: string): string {
  return decode(text);
}

/**
 * Décode les entités des champs texte indiqués (titres, noms, descriptions)
 * d'un objet renvoyé par le mu-plugin. Par sécurité seulement : depuis la
 * version 2.3.0, le mu-plugin renvoie déjà le texte brut. Ces champs sont
 * affichés comme du texte par React, jamais injectés comme du HTML.
 */
export function decodeTextFields<T extends object>(item: T, keys: readonly (keyof T)[]): T {
  const out = { ...item };
  for (const key of keys) {
    const value = out[key];
    if (typeof value === "string") out[key] = decode(value) as T[keyof T];
  }
  return out;
}
