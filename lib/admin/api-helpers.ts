import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clearAdminSession, getAdminSession, type AdminSession } from "./session";
import { hasTrustedOrigin } from "./csrf";
import { isSessionRejected, wordpressAuthedFetch, type WordpressUser } from "./wordpress-auth";
import { SESSION_EXPIRED_MESSAGE } from "./constants";

/** À appeler en tout début de chaque route /api/admin/* (lecture de la session comprise). */
export function requireTrustedOrigin(request: NextRequest): NextResponse | null {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  }
  return null;
}

/** Réponse renvoyée quand la session est absente, invalide ou refusée par WordPress. */
export function sessionExpiredResponse(): NextResponse {
  return NextResponse.json({ error: SESSION_EXPIRED_MESSAGE, expired: true }, { status: 401 });
}

export async function requireSession(): Promise<AdminSession | NextResponse> {
  const session = await getAdminSession();
  if (!session) {
    await clearAdminSession();
    return sessionExpiredResponse();
  }
  return session;
}

export function isErrorResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

export type WordpressCallResult =
  | { ok: true; data: unknown; headers: Headers }
  | { ok: false; status: number; error: string; expired: boolean };

function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

/**
 * Lit le corps d'une réponse WordPress en texte puis tente un JSON.parse
 * manuel (même logique défensive que lib/wordpress.ts) : un statut OK ne
 * garantit pas un corps JSON si le pare-feu de l'hébergement intervient.
 */
export async function readWordpressJson(res: Response): Promise<WordpressCallResult> {
  const raw = await res.text();
  let parsed: unknown = null;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {
        ok: false,
        status: 502,
        error: "Réponse WordPress invalide (non-JSON) — pare-feu de l'hébergement ?",
        expired: false,
      };
    }
  }

  if (!res.ok) {
    const body = (parsed && typeof parsed === "object" ? parsed : {}) as { message?: unknown; code?: unknown };
    const code = typeof body.code === "string" ? body.code : undefined;
    if (isSessionRejected(res.status, code)) {
      return { ok: false, status: 401, error: SESSION_EXPIRED_MESSAGE, expired: true };
    }
    const message = typeof body.message === "string" ? stripHtmlTags(body.message) : `Erreur WordPress (HTTP ${res.status}).`;
    return { ok: false, status: res.status, error: message, expired: false };
  }

  return { ok: true, data: parsed, headers: res.headers };
}

/**
 * Appel authentifié à WordPress avec la session courante. Un jeton expiré ou
 * refusé efface la session (le navigateur sera renvoyé à la connexion).
 */
export async function callWordpress(
  session: AdminSession,
  path: string,
  init: RequestInit = {},
): Promise<WordpressCallResult> {
  let res: Response;
  try {
    res = await wordpressAuthedFetch(path, session.token, init);
  } catch {
    return { ok: false, status: 502, error: "Impossible de contacter le serveur WordPress.", expired: false };
  }
  const result = await readWordpressJson(res);
  if (!result.ok && result.expired) await clearAdminSession();
  return result;
}

/** Réponse d'erreur JSON pour le navigateur (avec expired: true si la session doit être renouvelée). */
export function errorResponse(result: Extract<WordpressCallResult, { ok: false }>): NextResponse {
  if (result.expired) return sessionExpiredResponse();
  return NextResponse.json({ error: result.error }, { status: result.status });
}

/**
 * Rôles et droits confirmés par WordPress au moment de l'action (et non
 * repris du cookie ni du navigateur) : c'est sur eux que reposent le statut
 * d'un contenu et le droit de modérer.
 */
export async function confirmWordpressUser(
  session: AdminSession,
): Promise<{ ok: true; user: WordpressUser } | { ok: false; response: NextResponse }> {
  const result = await callWordpress(session, "/users/me?context=edit");
  if (!result.ok) return { ok: false, response: errorResponse(result) };
  const data = result.data as { id: number; name: string; roles?: string[]; capabilities?: Record<string, boolean> };
  return {
    ok: true,
    user: { id: data.id, name: data.name, roles: data.roles ?? [], capabilities: data.capabilities ?? {} },
  };
}

/** Peut publier ou rejeter le contenu d'un autre (administrateur, éditeur). */
export function userCanModerate(user: WordpressUser): boolean {
  return !!user.capabilities.edit_others_posts && !!user.capabilities.publish_posts;
}

export async function parseJsonBody<T>(request: NextRequest): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
