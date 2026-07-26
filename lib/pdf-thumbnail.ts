import { createCanvas } from "@napi-rs/canvas";

const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20 Mo — protège contre un PDF anormalement volumineux.
const FETCH_TIMEOUT_MS = 15_000;
const THUMB_WIDTH = 700;

export type PdfThumbnail = { buffer: Buffer; contentType: "image/jpeg" };

async function fetchPdfBytes(pdfUrl: string): Promise<Uint8Array | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(pdfUrl, { signal: controller.signal });
    if (!res.ok) return null;

    const contentLength = Number(res.headers.get("content-length") ?? 0);
    if (contentLength > MAX_PDF_BYTES) return null;

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_PDF_BYTES) return null;

    return new Uint8Array(arrayBuffer);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Rend la première page d'un PDF distant en JPEG. Renvoie null si le
 * téléchargement échoue, si le fichier n'est pas un PDF valide, ou si le
 * rendu échoue pour toute autre raison — l'appelant retombe alors sur la
 * carte stylisée plutôt que d'échouer.
 *
 * pdfjs-dist (build "legacy", ciblant Node) sait créer ses propres canvas
 * internes via @napi-rs/canvas dès qu'il détecte un environnement Node —
 * inutile de lui fournir une CanvasFactory maison. Seul le canvas de sortie
 * (celui qu'on récupère en JPEG) est créé explicitement ci-dessous.
 */
export async function renderPdfFirstPage(pdfUrl: string): Promise<PdfThumbnail | null> {
  const data = await fetchPdfBytes(pdfUrl);
  if (!data) return null;

  try {
    // Import dynamique : évite de charger pdf.js dans les bundles qui n'en ont pas besoin.
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const loadingTask = pdfjsLib.getDocument({ data, useSystemFonts: true });

    try {
      const doc = await loadingTask.promise;
      const page = await doc.getPage(1);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = THUMB_WIDTH / baseViewport.width;
      const viewport = page.getViewport({ scale });

      const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      const context = canvas.getContext("2d");

      await page.render({
        // @napi-rs/canvas's canvas/2D context implement the subset of the
        // DOM Canvas API pdf.js actually uses, but not the full DOM
        // interfaces TypeScript expects here.
        canvas: canvas as unknown as HTMLCanvasElement,
        canvasContext: context as unknown as CanvasRenderingContext2D,
        viewport,
      }).promise;

      const buffer = canvas.toBuffer("image/jpeg", 0.82);
      return { buffer, contentType: "image/jpeg" };
    } finally {
      await loadingTask.destroy();
    }
  } catch {
    return null;
  }
}
