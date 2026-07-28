import { createCanvas } from "@napi-rs/canvas";

const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20 Mo — protège contre un PDF anormalement volumineux.
const FETCH_TIMEOUT_MS = 20_000;
// Cible ~2x la largeur d'affichage habituelle de la carte (écrans HiDPI) —
// à 700px (1x), le texte dense d'un vrai rapport (bien plus petit que les
// gros titres d'un PDF de test) restait illisible une fois compressé.
const THUMB_WIDTH = 1400;

// Confirmé par les logs Render (2026-07-27) : dnpec.gov.gn (l'ancien site)
// renvoie HTTP 403 même avec un User-Agent non vide, dès lors qu'il
// s'identifie comme un outil automatisé — ici la chaîne précédente
// ("DNPEC-SitePreview/1.0") se signalait elle-même comme non-navigateur.
// Remplacé par un User-Agent de navigateur de bureau réel, plus le jeu
// d'en-têtes qu'un vrai navigateur envoie (Accept, Accept-Language), pour
// ne pas se distinguer sur un autre en-tête si le premier ne suffisait pas.
const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
};

export type PdfThumbnail = { buffer: Buffer; contentType: "image/png" };

/**
 * Domaines dont on sait, par preuve (logs Render), qu'ils bloquent les
 * requêtes serveur au-delà d'un simple en-tête User-Agent — un vrai
 * User-Agent de navigateur (PR #35) n'a pas suffi, donc la protection est
 * probablement basée sur un cookie de session, un challenge JavaScript ou un
 * blocage de l'IP du datacenter Render, aucun contournable avec un fetch()
 * simple. Plutôt que de retenter à chaque fois un téléchargement voué à
 * l'échec (perte de temps avant le repli), on saute directement à la carte
 * stylisée pour ces domaines.
 *
 * À RETIRER quand les documents encore hébergés sur l'ancien site (au moins :
 * Rapport CPIA, Rapport économique et financier, Code des marchés publics, et
 * une partie de TBMEG) auront été migrés vers l'hébergement WordPress
 * définitif — à ce moment-là, ce cas ne se posera plus.
 */
const KNOWN_BLOCKED_HOSTS = ["dnpec.gov.gn"];

function isKnownBlockedHost(pdfUrl: string): boolean {
  return KNOWN_BLOCKED_HOSTS.some((host) => pdfUrl.includes(host));
}

function log(reason: string, pdfUrl: string, detail?: unknown) {
  console.warn(`[pdf-thumbnail] ${reason}: ${pdfUrl}${detail ? ` — ${String(detail)}` : ""}`);
}

async function fetchPdfBytes(pdfUrl: string): Promise<Uint8Array | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(pdfUrl, { signal: controller.signal, headers: FETCH_HEADERS });
    if (!res.ok) {
      log("téléchargement refusé", pdfUrl, `HTTP ${res.status}`);
      return null;
    }

    const contentLength = Number(res.headers.get("content-length") ?? 0);
    if (contentLength > MAX_PDF_BYTES) {
      log("fichier trop volumineux (Content-Length)", pdfUrl, `${contentLength} octets`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_PDF_BYTES) {
      log("fichier trop volumineux (téléchargé)", pdfUrl, `${arrayBuffer.byteLength} octets`);
      return null;
    }

    return new Uint8Array(arrayBuffer);
  } catch (error) {
    const reason = error instanceof Error && error.name === "AbortError" ? "délai dépassé" : "échec réseau";
    log(reason, pdfUrl, error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Rend la première page d'un PDF distant en PNG. Renvoie null si le
 * téléchargement échoue, si le fichier n'est pas un PDF valide, ou si le
 * rendu échoue pour toute autre raison — l'appelant retombe alors sur la
 * carte stylisée plutôt que d'échouer. Chaque échec est journalisé avec sa
 * cause précise (cf. `log`) plutôt que de disparaître silencieusement.
 *
 * PNG plutôt que JPEG : le texte d'un vrai rapport est fin/dense, et la
 * compression JPEG avec perte y crée des artefacts qui ressemblent à du
 * texte flou ou dédoublé — un rendu de texte a besoin d'un encodage sans
 * perte pour rester net.
 *
 * pdfjs-dist (build "legacy", ciblant Node) sait créer ses propres canvas
 * internes via @napi-rs/canvas dès qu'il détecte un environnement Node —
 * inutile de lui fournir une CanvasFactory maison. Seul le canvas de sortie
 * (celui qu'on récupère en PNG) est créé explicitement ci-dessous.
 */
export async function renderPdfFirstPage(pdfUrl: string): Promise<PdfThumbnail | null> {
  if (isKnownBlockedHost(pdfUrl)) {
    log("domaine connu pour bloquer les requêtes serveur, repli immédiat sans tentative", pdfUrl);
    return null;
  }

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

      const buffer = canvas.toBuffer("image/png");
      return { buffer, contentType: "image/png" };
    } finally {
      await loadingTask.destroy();
    }
  } catch (error) {
    log("échec du rendu PDF", pdfUrl, error);
    return null;
  }
}
