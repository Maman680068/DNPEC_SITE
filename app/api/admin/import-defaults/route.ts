import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  callWordpress,
  confirmWordpressUser,
  errorResponse,
  isErrorResponse,
  parseJsonBody,
  requireSession,
  requireTrustedOrigin,
} from "@/lib/admin/api-helpers";
import { mockPartners, mockPublications } from "@/lib/mock-data";
import { revalidateContent } from "@/lib/revalidate-content";

export const runtime = "nodejs";

const LOGO_TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png" };

/**
 * Import unique (administrateur) : copie dans WordPress la liste affichée
 * aujourd'hui par défaut (lib/mock-data.ts), pour qu'elle ne disparaisse pas
 * du site dès qu'un premier élément est saisi dans WordPress. Les éléments
 * déjà présents (même identifiant) sont laissés tels quels : relancer
 * l'import ne crée pas de doublon.
 */
export async function POST(request: NextRequest) {
  const originError = requireTrustedOrigin(request);
  if (originError) return originError;
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const confirmed = await confirmWordpressUser(session);
  if (!confirmed.ok) return confirmed.response;
  if (!confirmed.user.roles.includes("administrator")) {
    return NextResponse.json({ error: "Import réservé aux administrateurs." }, { status: 403 });
  }

  const body = await parseJsonBody<{ type?: unknown }>(request);
  const type = body?.type;
  if (type !== "publications" && type !== "partenaires") {
    return NextResponse.json({ error: "Type d'import invalide." }, { status: 400 });
  }

  const existing = await callWordpress(session, `/${type}`);
  if (!existing.ok) return errorResponse(existing);
  const existingSlugs = new Set(
    (Array.isArray(existing.data) ? existing.data : []).map((item: { slug?: string }) => item.slug),
  );

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  if (type === "partenaires") {
    for (const [order, partner] of mockPartners.entries()) {
      if (existingSlugs.has(partner.id)) {
        skipped += 1;
        continue;
      }
      let featuredMediaId: number | undefined;
      if (partner.logoUrl?.startsWith("/")) {
        const filePath = path.join(process.cwd(), "public", partner.logoUrl);
        const contentType = LOGO_TYPES[path.extname(filePath).toLowerCase()];
        try {
          const bytes = await readFile(filePath);
          const media = await callWordpress(session, "/media", {
            method: "POST",
            headers: {
              "Content-Disposition": `attachment; filename="partenaire-${partner.id}${path.extname(filePath)}"`,
              "Content-Type": contentType ?? "application/octet-stream",
            },
            body: new Uint8Array(bytes),
          });
          if (media.ok) featuredMediaId = (media.data as { id?: number }).id;
          else if (media.expired) return errorResponse(media);
        } catch {
          // Logo manquant : le partenaire est créé sans logo.
        }
      }
      const result = await callWordpress(session, "/partenaires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: partner.name,
          slug: partner.id,
          order,
          websiteUrl: partner.websiteUrl,
          featuredMediaId,
        }),
      });
      if (result.ok) created += 1;
      else if (result.expired) return errorResponse(result);
      else errors.push(`${partner.name} : ${result.error}`);
    }
    revalidateContent({ type: "partenaire" });
  } else {
    for (const [order, publication] of mockPublications.entries()) {
      if (existingSlugs.has(publication.slug)) {
        skipped += 1;
        continue;
      }
      const result = await callWordpress(session, "/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: publication.title,
          slug: publication.slug,
          order,
          description: publication.description,
          type: publication.type,
          year: publication.year,
          href: publication.href,
          fileUrl: publication.fileUrl,
        }),
      });
      if (result.ok) created += 1;
      else if (result.expired) return errorResponse(result);
      else errors.push(`${publication.title} : ${result.error}`);
    }
    revalidateContent({ type: "publication" });
  }

  return NextResponse.json({ created, skipped, errors }, { status: errors.length > 0 ? 207 : 200 });
}
