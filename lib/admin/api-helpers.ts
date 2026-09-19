import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession, type AdminSession } from "./session";
import { hasTrustedOrigin } from "./csrf";

/** À appeler en tout début de chaque route /api/admin/* qui modifie des données. */
export function requireTrustedOrigin(request: NextRequest): NextResponse | null {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  }
  return null;
}

export async function requireSession(): Promise<AdminSession | NextResponse> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  }
  return session;
}

export function isErrorResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

/**
 * Lit le corps d'une réponse WordPress en texte puis tente un JSON.parse
 * manuel (même logique défensive que lib/wordpress.ts) : un statut OK ne
 * garantit pas un corps JSON si le pare-feu de l'hébergement intervient.
 */
export async function readWordpressJson(
  res: Response,
): Promise<{ ok: true; data: unknown } | { ok: false; error: string; status: number }> {
  const raw = await res.text();
  let parsed: unknown = null;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { ok: false, error: "Réponse WordPress invalide (non-JSON) — pare-feu de l'hébergement ?", status: 502 };
    }
  }

  if (!res.ok) {
    const message =
      parsed && typeof parsed === "object" && "message" in parsed
        ? String((parsed as { message: unknown }).message)
        : `Erreur WordPress (HTTP ${res.status}).`;
    return { ok: false, error: stripHtmlTags(message), status: res.status };
  }

  return { ok: true, data: parsed };
}

function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

export async function parseJsonBody<T>(request: NextRequest): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
