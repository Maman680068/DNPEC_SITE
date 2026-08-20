/**
 * Traduction automatique FR → EN (contenu WordPress).
 * Utilise MyMemory (gratuit, sans clé) ; les résultats sont mis en cache
 * côté fetch pour éviter de retraduire à chaque requête.
 */

const CHUNK = 420;
const LANGPAIR = "fr|en";

/** Intro laissée par seed-wp-en quand le corps n’a pas encore été traduit. */
export function isUntranslatedEnSeed(html: string): boolean {
  return /English version\.\s*The documents and detailed content below follow the French/i.test(
    html,
  );
}

/** Heuristique : le contenu « EN » est encore majoritairement en français. */
export function looksPrimarilyFrench(htmlOrText: string): boolean {
  const sample = htmlOrText
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 800)
    .toLowerCase();
  if (sample.length < 40) return false;
  const fr = (sample.match(/\b(les|des|une|dans|pour|avec|sont|cette|qui|aux|être|été|aussi|plus)\b/g) || [])
    .length;
  const en = (sample.match(/\b(the|and|for|with|this|that|from|are|its|also|more)\b/g) || []).length;
  return fr >= en + 2;
}

export function needsAutoTranslation(html: string): boolean {
  return isUntranslatedEnSeed(html) || looksPrimarilyFrench(html);
}

async function translateChunk(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed.slice(0, CHUNK))}&langpair=${LANGPAIR}`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 7 } });
    if (!res.ok) return text;
    const data = (await res.json()) as {
      responseData?: { translatedText?: string };
      responseStatus?: number;
    };
    const out = data.responseData?.translatedText;
    if (!out || data.responseStatus !== 200) return text;
    // MyMemory renvoie parfois le même texte ou un message d’erreur quota.
    if (/MYMEMORY WARNING/i.test(out)) return text;
    return out;
  } catch {
    return text;
  }
}

/** Découpe un long texte en morceaux sans couper au milieu d’un mot. */
function splitText(text: string): string[] {
  if (text.length <= CHUNK) return [text];
  const parts: string[] = [];
  let rest = text;
  while (rest.length > CHUNK) {
    let cut = rest.lastIndexOf(" ", CHUNK);
    if (cut < CHUNK * 0.4) cut = CHUNK;
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut).replace(/^\s+/, " ");
  }
  if (rest) parts.push(rest);
  return parts;
}

export async function translateTextFrToEn(text: string): Promise<string> {
  const plain = text.replace(/\s+/g, " ").trim();
  if (!plain) return text;
  const chunks = splitText(plain);
  const translated: string[] = [];
  for (const chunk of chunks) {
    translated.push(await translateChunk(chunk));
  }
  return translated.join(" ");
}

/**
 * Traduit le HTML en préservant les balises : seuls les nœuds texte
 * (hors script/style) sont envoyés au moteur de traduction.
 */
export async function translateHtmlFrToEn(html: string): Promise<string> {
  if (!html.trim()) return html;

  const tokens: string[] = [];
  const withPlaceholders = html.replace(/<[^>]+>/g, (tag) => {
    const i = tokens.length;
    tokens.push(tag);
    return `\uE000${i}\uE001`;
  });

  const segments = withPlaceholders.split(/(\uE000\d+\uE001)/);
  const out: string[] = [];

  for (const seg of segments) {
    const m = /^\uE000(\d+)\uE001$/.exec(seg);
    if (m) {
      out.push(tokens[Number(m[1])] ?? "");
      continue;
    }
    if (!seg.trim()) {
      out.push(seg);
      continue;
    }
    // Ne pas traduire les URLs / e-mails isolés.
    if (/^https?:\/\/\S+$/i.test(seg.trim()) || /^[\w.+-]+@[\w.-]+$/i.test(seg.trim())) {
      out.push(seg);
      continue;
    }
    out.push(await translateTextFrToEn(seg));
  }

  return out.join("");
}
