import type { NextRequest } from "next/server";
import { renderPdfFirstPage, type PdfThumbnail } from "@/lib/pdf-thumbnail";

export const runtime = "nodejs";

const CACHE_HEADERS = "public, max-age=86400, stale-while-revalidate=604800";

// Cache mémoire du process — vit tant que l'instance Render reste chaude,
// et est complété par le Cache-Control ci-dessus côté navigateur/CDN.
const cache = new Map<string, PdfThumbnail>();
const inflight = new Map<string, Promise<PdfThumbnail | null>>();

function isAllowedPdfUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const pdfUrl = req.nextUrl.searchParams.get("url");
  if (!pdfUrl || !isAllowedPdfUrl(pdfUrl)) {
    return new Response(null, { status: 400 });
  }

  const cached = cache.get(pdfUrl);
  if (cached) {
    return new Response(new Uint8Array(cached.buffer), {
      headers: { "Content-Type": cached.contentType, "Cache-Control": CACHE_HEADERS },
    });
  }

  let pending = inflight.get(pdfUrl);
  if (!pending) {
    pending = renderPdfFirstPage(pdfUrl);
    inflight.set(pdfUrl, pending);
    pending.finally(() => inflight.delete(pdfUrl));
  }

  const result = await pending;
  if (!result) {
    // Le client (PublicationsCarousel) bascule sur le repli stylisé via onError.
    return new Response(null, { status: 502 });
  }

  cache.set(pdfUrl, result);
  return new Response(new Uint8Array(result.buffer), {
    headers: { "Content-Type": result.contentType, "Cache-Control": CACHE_HEADERS },
  });
}
