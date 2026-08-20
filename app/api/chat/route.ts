import { demoChatReply } from "@/lib/chat/demo-engine";
import type { ChatApiRequest, ChatApiResponse } from "@/lib/chat/types";
import { isLocale } from "@/lib/i18n/config";

export const runtime = "nodejs";

const SYSTEM_FR = `Tu es l'Assistant DNPEC, l'assistant officiel du site de la Direction Nationale des Prévisions Économiques et de la Conjoncture (République de Guinée), rattachée au Ministère de l'Économie, des Finances et du Budget.

Ton rôle : aider les visiteurs à comprendre la DNPEC, ses missions, publications, actualités, revue RPAE et contacts. Ton est institutionnel, clair et concis.

Liens utiles du site (chemins relatifs) :
- /la-dnpec/mission — Mission
- /la-dnpec/mot-du-directeur — Mot du Directeur National
- /la-dnpec/historique — Historique
- /publications — Publications
- /actualites — Actualités
- /revue-scientifique — Revue RPAE
- /revue-scientifique/soumettre — Soumettre un article
- /quelques-chiffres — Indicateurs
- /contact — Contact
- /ecrire-au-directeur-national — Écrire au Directeur

Réponds en français. Utilise le markdown léger (**gras**, listes, [libellé](/chemin)). Si tu ne sais pas, oriente vers Contact. Ne invente pas de statistiques non publiées.`;

const SYSTEM_EN = `You are the DNPEC Assistant, the official assistant for the website of the National Directorate of Economic Forecasting and the Business Cycle (Republic of Guinea), under the Ministry of Economy, Finance and Budget.

Help visitors understand DNPEC, its missions, publications, news, RPAE journal and contacts. Tone: institutional, clear, concise.

Useful site paths:
- /la-dnpec/mission — Mission
- /la-dnpec/mot-du-directeur — Message from the National Director
- /publications — Publications
- /actualites — News
- /revue-scientifique — RPAE journal
- /contact — Contact

Reply in English. Use light markdown (**bold**, lists, [label](/path)). If unsure, point to Contact. Do not invent unpublished statistics.`;

function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

async function callClaude(
  messages: ChatApiRequest["messages"],
  locale: "fr" | "en",
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY!.trim();
  const model = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-5-20250929";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: locale === "en" ? SYSTEM_EN : SYSTEM_FR,
      messages: messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text = data.content?.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("Empty Claude response");
  return text;
}

export async function POST(request: Request) {
  let body: ChatApiRequest;
  try {
    body = (await request.json()) as ChatApiRequest;
  } catch {
    return Response.json({ error: "JSON invalide" }, { status: 400 });
  }

  const locale = isLocale(body.locale) ? body.locale : "fr";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser?.content?.trim()) {
    return Response.json({ error: "Message manquant" }, { status: 400 });
  }

  // Limite basique anti-abus
  if (lastUser.content.length > 2000 || messages.length > 40) {
    return Response.json({ error: "Requête trop longue" }, { status: 400 });
  }

  try {
    if (hasAnthropicKey()) {
      const content = await callClaude(messages.slice(-20), locale);
      const payload: ChatApiResponse = { content, mode: "claude" };
      return Response.json(payload);
    }

    // Petite latence pour un effet « pensé » en démo
    await new Promise((r) => setTimeout(r, 450 + Math.random() * 550));
    const content = demoChatReply(lastUser.content, locale);
    const payload: ChatApiResponse = { content, mode: "demo" };
    return Response.json(payload);
  } catch (error) {
    console.warn("[chat]", error);
    // Repli démo si Claude échoue (clé invalide, quota…)
    const content = demoChatReply(lastUser.content, locale);
    const payload: ChatApiResponse = { content, mode: "demo" };
    return Response.json(payload);
  }
}
