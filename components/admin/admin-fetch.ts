"use client";

import { ADMIN_LOGIN_PATH } from "@/lib/admin/constants";

export type AdminFetchResult<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Appel d'une route /api/admin/* depuis le navigateur. Session expirée →
 * retour à la page de connexion avec le message correspondant. Toute autre
 * erreur est renvoyée telle qu'expliquée par le serveur.
 */
export async function adminFetch<T = unknown>(url: string, init: RequestInit = {}): Promise<AdminFetchResult<T>> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    return { ok: false, error: "Impossible de joindre le site. Vérifiez votre connexion internet puis réessayez." };
  }
  const data = (await res.json().catch(() => null)) as (T & { error?: string; expired?: boolean }) | null;
  if (res.status === 401 && data?.expired) {
    const next = encodeURIComponent(window.location.pathname);
    window.location.assign(`${ADMIN_LOGIN_PATH}?expiree=1&next=${next}`);
    return { ok: false, error: data.error ?? "Session expirée, reconnectez-vous." };
  }
  if (!res.ok) return { ok: false, error: data?.error || `Erreur du serveur (HTTP ${res.status}).` };
  return { ok: true, data: data as T };
}

export function jsonInit(method: string, body: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}
