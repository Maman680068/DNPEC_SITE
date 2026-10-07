import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { loginToWordpress } from "@/lib/admin/wordpress-auth";
import { jwtExpiry, MissingSessionSecretError, setAdminSession } from "@/lib/admin/session";
import { requireTrustedOrigin } from "@/lib/admin/api-helpers";

export const runtime = "nodejs";

/**
 * Limite des échecs de connexion, en mémoire du process (remise à zéro à
 * chaque redémarrage Render) : 8 échecs en 10 minutes pour un même
 * identifiant depuis une même adresse. Seuls les échecs comptent, et une
 * connexion réussie efface le compteur : un bureau entier derrière la même
 * adresse n'est donc pas bloqué par des connexions normales.
 */
const failures = new Map<string, { count: number; resetAt: number }>();
const MAX_FAILURES = 8;
const WINDOW_MS = 10 * 60 * 1000;

/**
 * Adresse du visiteur : Render ajoute l'adresse réelle EN DERNIER dans
 * X-Forwarded-For. Les valeurs précédentes peuvent être inventées par le
 * client et ne sont donc jamais utilisées.
 */
function clientAddress(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const last = forwarded?.split(",").map((part) => part.trim()).filter(Boolean).pop();
  return last || "inconnue";
}

function isBlocked(key: string): boolean {
  const entry = failures.get(key);
  if (!entry) return false;
  if (entry.resetAt < Date.now()) {
    failures.delete(key);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

function recordFailure(key: string): void {
  const now = Date.now();
  const entry = failures.get(key);
  if (!entry || entry.resetAt < now) {
    failures.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
  // Évite une croissance illimitée de la table en mémoire.
  if (failures.size > 5000) {
    for (const [k, v] of failures) if (v.resetAt < now) failures.delete(k);
  }
}

export async function POST(request: NextRequest) {
  const originError = requireTrustedOrigin(request);
  if (originError) return originError;

  let body: { identifiant?: string; motDePasse?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const identifiant = body.identifiant?.trim();
  const motDePasse = body.motDePasse;
  if (!identifiant || !motDePasse) {
    return NextResponse.json({ error: "Identifiant et mot de passe requis." }, { status: 400 });
  }

  const key = `${identifiant.toLowerCase()}|${clientAddress(request)}`;
  if (isBlocked(key)) {
    return NextResponse.json(
      { error: "Trop de tentatives de connexion échouées. Réessayez dans quelques minutes." },
      { status: 429 },
    );
  }

  const result = await loginToWordpress(identifiant, motDePasse);
  if (!result.ok) {
    if (result.badCredentials) recordFailure(key);
    return NextResponse.json({ error: result.error }, { status: result.badCredentials ? 401 : 502 });
  }

  const exp = jwtExpiry(result.token);
  if (!exp || exp * 1000 <= Date.now()) {
    return NextResponse.json({ error: "Jeton WordPress sans date d'expiration valide." }, { status: 502 });
  }

  try {
    await setAdminSession({
      token: result.token,
      userId: result.user.id,
      name: result.user.name,
      roles: result.user.roles,
      exp,
    });
  } catch (error) {
    if (error instanceof MissingSessionSecretError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }

  failures.delete(key);
  return NextResponse.json({ name: result.user.name, roles: result.user.roles });
}
