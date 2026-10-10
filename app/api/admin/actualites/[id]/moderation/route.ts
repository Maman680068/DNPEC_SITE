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
  userCanModerate,
} from "@/lib/admin/api-helpers";
import { isRpaePost, rpaeCategoryIdsFor, type WpPostEdit } from "@/lib/admin/actualites";
import { ACTUALITE_REJECT_MARKER, isRejectedActualite, withoutRejectMarkers } from "@/lib/admin/markers";
import { revalidateContent } from "@/lib/revalidate-content";
import { isNumericId } from "@/lib/admin/constants";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * Publier ou rejeter une actualité : { action: "publier" | "rejeter" }.
 * WordPress refuse le statut « trash » en modification : « Rejeter » suit
 * donc le circuit de la revue scientifique — brouillon + marqueur de rejet
 * dans le contenu (jamais de suppression), badge « Rejeté » et entrée au
 * journal. Statut et journal sont décidés ici, d'après l'action et les droits
 * confirmés par WordPress.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const originError = requireTrustedOrigin(request);
  if (originError) return originError;
  const { id } = await params;
  if (!isNumericId(id)) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const body = await parseJsonBody<{ action?: unknown }>(request);
  const action = body?.action;
  if (action !== "publier" && action !== "rejeter") {
    return NextResponse.json({ error: "Action invalide." }, { status: 400 });
  }

  const confirmed = await confirmWordpressUser(session);
  if (!confirmed.ok) return confirmed.response;
  if (!userCanModerate(confirmed.user)) {
    return NextResponse.json(
      { error: "Seul un administrateur ou un éditeur peut publier ou rejeter un article." },
      { status: 403 },
    );
  }

  const current = await callWordpress(session, `/posts/${encodeURIComponent(id)}?context=edit`);
  if (!current.ok) return errorResponse(current);
  const post = current.data as WpPostEdit;
  if (isRpaePost(post, await rpaeCategoryIdsFor(session))) {
    return NextResponse.json(
      { error: "Cet article appartient à la revue scientifique : validez-le depuis la page Revue scientifique." },
      { status: 400 },
    );
  }

  const raw = post.content.raw ?? "";
  const payload: Record<string, unknown> =
    action === "publier"
      ? { status: "publish", dnpec_log_action: "publier" }
      : { status: "draft", dnpec_log_action: "rejeter" };
  if (action === "publier" && isRejectedActualite(raw)) payload.content = withoutRejectMarkers(raw);
  if (action === "rejeter" && !isRejectedActualite(raw)) payload.content = `${raw}\n${ACTUALITE_REJECT_MARKER}`;

  const result = await callWordpress(session, `/posts/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!result.ok) return errorResponse(result);
  // Publication ou retrait du site : les pages publiques sont rafraîchies dans les deux cas.
  revalidateContent({ type: "post", slug: (result.data as { slug?: string }).slug });
  return NextResponse.json(result.data);
}
