import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { loginToWordpress } from "@/lib/admin/wordpress-auth";
import { jwtExpiry, MissingSessionSecretError, setAdminSession } from "@/lib/admin/session";
import { requireTrustedOrigin } from "@/lib/admin/api-helpers";

export const runtime = "nodejs";

/**
 * Limite des tentatives de connexion, en mémoire du process (remise à zéro à
 * chaque redémarrage Render) : 8 mots de passe faux en 10 minutes pour un
 * même identifiant depuis une même adresse.
 *
 * La tentative est comptée AVANT l'appel à WordPress : 20 essais envoyés en
 * même temps ne passent donc pas tous (les 8 premiers réservent les places,
 * les suivants reçoivent 429). Une connexion réussie efface le compteur ; une
 * tentative qui n'a pas échoué sur le mot de passe (WordPress injoignable,
 * compte sans droit d'accès) rend sa place : un bureau entier derrière la
 * même adresse n'est pas bloqué par des connexions normales.
 */
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_FAILURES = 8;
const WINDOW_MS = 10 * 60 * 1000;

/**
 * Adresse du visiteur. Sur Render, chaque requête vers un service web public
 * passe par Cloudflare, qui écrit CF-Connecting-IP avec l'adresse réelle et
 * remplace toute valeur envoyée par le client. X-Forwarded-For ne convient
 * pas : Render ne fait qu'y ajouter des adresses (la première peut être
 * inventée, la dernière est souvent un serveur Cloudflare qui change d'une
 * connexion à l'autre). Hors Render (poste local), on retombe sur la
 * dernière valeur de X-Forwarded-For.
 */
function clientAddress(request: NextRequest): string {
  const cloudflare = request.headers.get("cf-connecting-ip")?.trim();
  if (cloudflare) return cloudflare;
  const forwarded = request.headers.get("x-forwarded-for");
  const last = forwarded?.split(",").map((part) => part.trim()).filter(Boolean).pop();
  return last || "inconnue";
}

/**
 * Journal TEMPORAIRE (à retirer après vérification dans les journaux Render) :
 * en-têtes d'adresse uniquement — jamais l'identifiant ni le mot de passe.
 */
function logAddressHeaders(request: NextRequest, retained: string): void {
  const pick = (name: string) => request.headers.get(name) ?? "-";
  console.info(
    `[connexion-adresse] retenue=${retained} cf-connecting-ip=${pick("cf-connecting-ip")} ` +
      `true-client-ip=${pick("true-client-ip")} x-real-ip=${pick("x-real-ip")} ` +
      `x-forwarded-for=${pick("x-forwarded-for")}`,
  );
}

/** Réserve une tentative ; false si la limite est déjà atteinte. */
function reserveAttempt(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else if (entry.count >= MAX_FAILURES) {
    return false;
  } else {
    entry.count += 1;
  }
  // Évite une croissance illimitée de la table en mémoire.
  if (attempts.size > 5000) {
    for (const [k, v] of attempts) if (v.resetAt < now) attempts.delete(k);
  }
  return true;
}

/** Rend la place réservée par une tentative qui n'a pas échoué sur le mot de passe. */
function releaseAttempt(key: string): void {
  const entry = attempts.get(key);
  if (!entry) return;
  entry.count -= 1;
  if (entry.count <= 0) attempts.delete(key);
}

export async function POST(request: NextRequest) {
  const originError = requireTrustedOrigin(request);
  if (originError) return originError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const fields = (body && typeof body === "object" ? body : {}) as { identifiant?: unknown; motDePasse?: unknown };
  const identifiant = typeof fields.identifiant === "string" ? fields.identifiant.trim() : "";
  const motDePasse = typeof fields.motDePasse === "string" ? fields.motDePasse : "";
  if (!identifiant || !motDePasse) {
    return NextResponse.json({ error: "Identifiant et mot de passe requis." }, { status: 400 });
  }

  const address = clientAddress(request);
  logAddressHeaders(request, address);
  const key = `${identifiant.toLowerCase()}|${address}`;
  if (!reserveAttempt(key)) {
    return NextResponse.json(
      { error: "Trop de tentatives de connexion échouées. Réessayez dans quelques minutes." },
      { status: 429 },
    );
  }

  const result = await loginToWordpress(identifiant, motDePasse);
  if (!result.ok) {
    if (!result.badCredentials) releaseAttempt(key);
    return NextResponse.json({ error: result.error }, { status: result.badCredentials ? 401 : 502 });
  }

  // Un abonné (sans droit de rédaction) n'a rien à faire dans l'espace contributeurs.
  if (!result.user.capabilities.edit_posts) {
    releaseAttempt(key);
    return NextResponse.json(
      {
        error:
          "Ce compte WordPress n'a pas accès à l'espace contributeurs : il faut au moins le rôle Contributeur. Demandez-le à un administrateur du site.",
      },
      { status: 403 },
    );
  }

  const exp = jwtExpiry(result.token);
  if (!exp || exp * 1000 <= Date.now()) {
    releaseAttempt(key);
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
      releaseAttempt(key);
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }

  attempts.delete(key);
  return NextResponse.json({ name: result.user.name, roles: result.user.roles });
}
