import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clearAdminSession, getAdminSession } from "@/lib/admin/session";
import { fetchWordpressMe } from "@/lib/admin/wordpress-auth";
import { ADMIN_BASE_PATH, ADMIN_LOGIN_PATH } from "@/lib/admin/constants";

export const runtime = "nodejs";

/**
 * Une page de l'espace contributeurs a reçu un refus de WordPress (jeton
 * expiré ou invalide) : on efface la session puis on renvoie à la connexion
 * avec le message « Session expirée ». Un Composant Serveur ne peut pas
 * effacer un cookie lui-même, d'où ce détour.
 *
 * Par prudence, la session n'est effacée que si WordPress la refuse
 * réellement : un lien vers cette adresse ne peut pas déconnecter quelqu'un
 * dont la session est valide.
 */
export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (session && (await fetchWordpressMe(session.token))) {
    return NextResponse.redirect(new URL(ADMIN_BASE_PATH, request.url));
  }
  await clearAdminSession();
  const url = new URL(ADMIN_LOGIN_PATH, request.url);
  url.searchParams.set("expiree", "1");
  return NextResponse.redirect(url);
}
