export type ContentImage = { src: string; alt: string };

/**
 * Retire toutes les balises <img> d'un contenu HTML WordPress et les renvoie
 * à part, pour être affichées dans une grille gérée par React (classes
 * Tailwind) plutôt que de dépendre de la mise en page CSS (inline ou via
 * classes de bloc Gutenberg) présente dans le contenu — plus robuste face à
 * un contenu WordPress dont la structure peut varier.
 */
export function extractImages(html: string): { text: string; images: ContentImage[] } {
  const images: ContentImage[] = [];

  let text = html.replace(/<img\b[^>]*>/gi, (tag) => {
    const srcMatch = tag.match(/\bsrc=["']([^"']+)["']/i);
    if (!srcMatch) return tag;
    const altMatch = tag.match(/\balt=["']([^"']*)["']/i);
    images.push({ src: srcMatch[1], alt: altMatch?.[1] ?? "" });
    return "";
  });

  // Nettoie les conteneurs (galeries, colonnes) qui ne contenaient que des
  // images et sont maintenant vides. Plusieurs passes pour les conteneurs
  // imbriqués (ex. figure vide dans un div vide).
  for (let i = 0; i < 3; i++) {
    text = text.replace(/<(div|figure|p|ul|li)(?:\s[^>]*)?>\s*<\/\1>/gi, "");
  }

  return { text, images };
}
