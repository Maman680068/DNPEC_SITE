import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_HINT_COOKIE } from "./constants";

/**
 * Session de l'espace contributeurs — un seul cookie httpOnly contenant le
 * jeton JWT WordPress + les infos utilisateur nécessaires à l'interface
 * (nom, rôles). Le jeton n'est jamais lisible par du code client : toute
 * page ou route API qui en a besoin le lit ici, côté serveur.
 *
 * Le cookie est signé (HMAC-SHA256, secret ADMIN_SESSION_SECRET) : un
 * contenu modifié à la main (rôle « administrator » ajouté, par exemple)
 * est refusé. Il expire en même temps que le jeton JWT (champ exp).
 */

export type AdminSession = {
  token: string;
  userId: number;
  name: string;
  roles: string[];
  /** Expiration du jeton JWT, en secondes depuis 1970 (champ exp). */
  exp: number;
};

export class MissingSessionSecretError extends Error {
  constructor() {
    super("ADMIN_SESSION_SECRET n'est pas configuré sur ce serveur (32 caractères au moins).");
  }
}

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new MissingSessionSecretError();
  return secret;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function encodeSession(session: AdminSession): string {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  return `${payload}.${sign(payload, sessionSecret())}`;
}

/** Contenu du cookie si la signature est valide et le jeton non expiré, sinon null. */
export function decodeSession(raw: string | undefined): AdminSession | null {
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);

  let secret: string;
  try {
    secret = sessionSecret();
  } catch {
    return null;
  }
  const expected = Buffer.from(sign(payload, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<AdminSession>;
    if (!parsed.token || !parsed.userId || !parsed.name || !Array.isArray(parsed.roles) || !parsed.exp) return null;
    if (parsed.exp * 1000 <= Date.now()) return null;
    return parsed as AdminSession;
  } catch {
    return null;
  }
}

/** Expiration (champ exp) lue dans le jeton JWT renvoyé par WordPress, ou null. */
export function jwtExpiry(token: string): number | null {
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    const payload = JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as { exp?: unknown };
    return typeof payload.exp === "number" && Number.isFinite(payload.exp) ? payload.exp : null;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  return decodeSession(store.get(ADMIN_SESSION_COOKIE)?.value);
}

/** À appeler uniquement depuis une Route Handler (app/api/admin/...), jamais depuis un Server Component. */
export async function setAdminSession(session: AdminSession): Promise<void> {
  const store = await cookies();
  const maxAge = Math.max(0, Math.floor(session.exp - Date.now() / 1000));
  store.set(ADMIN_SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  store.set(ADMIN_SESSION_HINT_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
  store.delete(ADMIN_SESSION_HINT_COOKIE);
}
