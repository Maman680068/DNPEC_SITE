import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { loginToWordpress } from "@/lib/admin/wordpress-auth";
import { setAdminSession } from "@/lib/admin/session";
import { hasTrustedOrigin } from "@/lib/admin/csrf";

export const runtime = "nodejs";

/**
 * Anti-brute-force minimal, best-effort : compteur en mémoire du process.
 * Se réinitialise à chaque redémarrage/redéploiement Render — pas une
 * protection absolue, juste un frein raisonnable sans dépendance externe.
 */
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Trop de tentatives de connexion. Réessayez dans quelques minutes." },
      { status: 429 },
    );
  }

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

  const result = await loginToWordpress(identifiant, motDePasse);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  await setAdminSession({
    token: result.token,
    userId: result.user.id,
    name: result.user.name,
    roles: result.user.roles,
  });

  return NextResponse.json({ name: result.user.name, roles: result.user.roles });
}
