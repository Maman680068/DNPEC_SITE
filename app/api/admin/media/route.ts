import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireTrustedOrigin, requireSession, isErrorResponse, readWordpressJson } from "@/lib/admin/api-helpers";
import { WP_BROWSER_HEADERS } from "@/lib/wordpress-headers";

export const runtime = "nodejs";

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL;
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 Mo — suffisant pour un logo/une image, évite un envoi accidentel énorme

/**
 * Dépose un fichier (image, PDF…) sur WordPress via /wp/v2/media, avec le
 * jeton de la personne connectée — utilisé par tous les formulaires de
 * l'espace contributeurs qui ont besoin d'uploader un fichier avant de
 * créer/modifier un contenu (image à la une, logo, PDF de publication).
 */
export async function POST(request: NextRequest) {
  const originError = requireTrustedOrigin(request);
  if (originError) return originError;

  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  if (!WORDPRESS_API_URL) {
    return NextResponse.json({ error: "WORDPRESS_API_URL n'est pas configurée sur ce serveur." }, { status: 503 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Fichier trop volumineux (8 Mo maximum)." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  let res: Response;
  try {
    res = await fetch(`${WORDPRESS_API_URL}/media`, {
      method: "POST",
      headers: {
        ...WP_BROWSER_HEADERS,
        Authorization: `Bearer ${session.token}`,
        "Content-Disposition": `attachment; filename="${sanitizeFilename(file.name)}"`,
        "Content-Type": file.type || "application/octet-stream",
      },
      body: bytes,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Impossible de contacter le serveur WordPress." }, { status: 502 });
  }

  const result = await readWordpressJson(res);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const media = result.data as { id?: number; source_url?: string };
  return NextResponse.json({ id: media.id, url: media.source_url });
}

function sanitizeFilename(name: string): string {
  return name.replace(/["\r\n]/g, "_");
}
