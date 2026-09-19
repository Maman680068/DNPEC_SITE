import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "./constants";

/**
 * Session de l'espace contributeurs — un seul cookie httpOnly contenant le
 * jeton JWT WordPress + les infos utilisateur nécessaires à l'interface
 * (nom, rôles). Le jeton ne quitte jamais le navigateur : toute page ou
 * route API qui en a besoin le lit ici, côté serveur, jamais via du code
 * client.
 */

export type AdminSession = {
  token: string;
  userId: number;
  name: string;
  roles: string[];
};

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 jours — durée de la session navigateur, pas d'expiration du jeton lui-même

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const raw = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AdminSession>;
    if (!parsed.token || !parsed.userId || !parsed.name || !Array.isArray(parsed.roles)) return null;
    return parsed as AdminSession;
  } catch {
    return null;
  }
}

/** À appeler uniquement depuis une Route Handler (app/api/admin/...), jamais depuis un Server Component. */
export async function setAdminSession(session: AdminSession): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
}
