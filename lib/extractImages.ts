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

  // Une balise <style> ne doit jamais être injectée telle quelle via
  // dangerouslySetInnerHTML — ses règles s'appliqueraient à toute la page,
  // pas seulement au contenu de l'article.
  let text = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");

  text = text.replace(/<img\b[^>]*>/gi, (tag) => {
    const srcMatch = tag.match(/\bsrc=["']([^"']+)["']/i);
    if (!srcMatch) return tag;
    const altMatch = tag.match(/\balt=["']([^"']*)["']/i);
    images.push({ src: srcMatch[1], alt: altMatch?.[1] ?? "" });
    return "";
  });

  // Nettoie les conteneurs (galeries, colonnes) qui ne contenaient que des
  // images — et rien d'autre que des espaces ou <br> — et sont maintenant
  // vides. Boucle jusqu'à stabilité pour couvrir n'importe quelle
  // profondeur d'imbrication (ex. figure vide dans un div vide dans un ul).
  const emptyContainer = /<(div|figure|p|ul|li|span)(?:\s[^>]*)?>(?:\s|<br\s*\/?>)*<\/\1>/gi;
  let previous: string;
  do {
    previous = text;
    text = text.replace(emptyContainer, "");
  } while (text !== previous);

  return { text: text.trim(), images };
}
