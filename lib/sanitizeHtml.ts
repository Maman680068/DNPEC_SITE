import sanitizeHtml from "sanitize-html";

/**
 * Nettoyage du HTML venant de WordPress (ou d'un service de traduction)
 * avant toute injection via dangerouslySetInnerHTML.
 *
 * Liste blanche : texte, titres, listes, tableaux, citations, liens
 * http/https/mailto/relatifs, images, figures. Tout le reste est retiré :
 * scripts, iframes (aucune page actuelle n'en contient), attributs on*,
 * attribut style, URL javascript:/data:, commentaires HTML (où le
 * formulaire RPAE range e-mail et téléphone des auteurs).
 *
 * Les entités ne sont jamais décodées ici : un « &lt;img …&gt; » enregistré
 * dans WordPress reste un texte affiché tel quel.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr", "div", "span",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "strong", "b", "em", "i", "u", "s", "sub", "sup", "small", "mark", "abbr", "cite", "q", "code", "pre",
    "blockquote",
    "ul", "ol", "li", "dl", "dt", "dd",
    "table", "caption", "colgroup", "col", "thead", "tbody", "tfoot", "tr", "th", "td",
    "a", "img", "figure", "figcaption",
  ],
  allowedAttributes: {
    "*": ["class", "title", "lang", "dir"],
    a: ["href", "target", "rel", "name"],
    img: ["src", "alt", "width", "height", "loading", "decoding"],
    ol: ["start", "type", "reversed"],
    th: ["colspan", "rowspan", "scope"],
    td: ["colspan", "rowspan"],
    col: ["span"],
    colgroup: ["span"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  // Contenu retiré avec la balise (et non seulement la balise).
  nonTextTags: ["script", "style", "textarea", "option", "noscript", "iframe", "object", "embed", "template"],
  transformTags: {
    a: (tagName, attribs) => {
      const next = { ...attribs };
      if (next.target && next.target !== "_blank" && next.target !== "_self") delete next.target;
      if (next.target === "_blank") next.rel = "noopener noreferrer";
      return { tagName, attribs: next };
    },
  },
};

export function sanitizeWpHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, OPTIONS);
}
