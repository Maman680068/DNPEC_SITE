import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { callWordpress, errorResponse, isErrorResponse, requireSession, requireTrustedOrigin } from "@/lib/admin/api-helpers";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 Mo, même limite que le mu-plugin WordPress
const MULTIPART_OVERHEAD = 64 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

/**
 * Nom de fichier pour l'en-tête Content-Disposition : version ASCII de
 * secours (accents retirés, « ’ », « — » et séparateurs d'en-tête remplacés) et version UTF-8
 * complète (filename*, RFC 5987). Un en-tête HTTP ne peut pas contenir
 * « ’ » tel quel : c'est ce qui faisait échouer l'envoi de
 * « note d’analyse.pdf » avec un message trompeur.
 */
function contentDisposition(name: string, extension: string): string {
  const base = name.replace(/[\r\n"\\/]/g, " ").trim() || `fichier.${extension}`;
  const ascii =
    base
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[’‘]/g, "'")
      .replace(/[–—]/g, "-")
      .replace(/[^\x20-\x7e]/g, "_")
      // Séparateurs d'en-tête HTTP (« ; », « , », « = », guillemets…) remplacés.
      .replace(/[';,=()<>@:[\]?{}]/g, "_") || `fichier.${extension}`;
  const encoded = encodeURIComponent(base).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

/**
 * Dépose une image ou un PDF sur WordPress via /wp/v2/media, avec le jeton
 * de la personne connectée (le mu-plugin accorde ce droit aux contributeurs).
 */
export async function POST(request: NextRequest) {
  const originError = requireTrustedOrigin(request);
  if (originError) return originError;
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  // Taille contrôlée avant de lire le corps : formData() lirait tout en
  // mémoire, donc une requête sans taille annoncée est refusée.
  const lengthHeader = request.headers.get("content-length");
  const declared = lengthHeader !== null && /^\d+$/.test(lengthHeader.trim()) ? Number(lengthHeader) : NaN;
  if (!Number.isFinite(declared)) {
    return NextResponse.json({ error: "Taille du fichier non annoncée : envoi refusé." }, { status: 411 });
  }
  if (declared > MAX_SIZE_BYTES + MULTIPART_OVERHEAD) {
    return NextResponse.json({ error: "Fichier trop volumineux (8 Mo maximum)." }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Envoi du fichier interrompu. Réessayez." }, { status: 400 });
  }
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Fichier trop volumineux (8 Mo maximum)." }, { status: 413 });
  }
  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Type de fichier non accepté : images (JPG, PNG, GIF, WebP) ou PDF uniquement." },
      { status: 415 },
    );
  }

  const result = await callWordpress(session, "/media", {
    method: "POST",
    headers: {
      "Content-Disposition": contentDisposition(file.name, extension),
      "Content-Type": file.type,
    },
    body: new Uint8Array(await file.arrayBuffer()),
  });
  if (!result.ok) return errorResponse(result);

  const media = result.data as { id?: number; source_url?: string };
  return NextResponse.json({ id: media.id, url: media.source_url, sizeKb: Math.max(1, Math.round(file.size / 1024)) });
}
