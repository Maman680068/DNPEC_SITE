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
import { RPAE_REFUSE_MARKER, isRefusedRpae, withoutRejectMarkers } from "@/lib/admin/markers";
import { isInternalRpaeUsage, parseRpaeMetadata, RPAE_INTERNAL_CATEGORY_SLUG } from "@/lib/rpae";
import { decodeHtmlEntities } from "@/lib/decodeHtml";
import { revalidateContent } from "@/lib/revalidate-content";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * Publier ou rejeter un article RPAE : { action: "publier" | "rejeter" }.
 * Réservé aux administrateurs et éditeurs (droits confirmés par WordPress).
 * « Rejeter » suit le workflow du comité : brouillon + marqueur
 * <!-- rpae:statut-soumission refuse --> (jamais de suppression).
 * Un article « usage interne » ou « sur commande » n'est jamais publié.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const originError = requireTrustedOrigin(request);
  if (originError) return originError;
  const { id } = await params;
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
      { error: "Seul un administrateur ou un éditeur peut valider ou rejeter un article de la revue scientifique." },
      { status: 403 },
    );
  }

  const current = await callWordpress(session, `/posts/${encodeURIComponent(id)}?context=edit`);
  if (!current.ok) return errorResponse(current);
  const post = current.data as WpPostEdit;
  const rpaeIds = await rpaeCategoryIdsFor(session);
  if (!isRpaePost(post, rpaeIds)) {
    return NextResponse.json({ error: "Cet article n'appartient pas à la revue scientifique." }, { status: 400 });
  }

  // Contenu brut (context=edit) : reprendre le contenu rendu le déformerait à chaque action.
  const raw = post.content.raw ?? "";
  if (action === "publier") {
    const meta = parseRpaeMetadata(decodeHtmlEntities(raw));
    const internalCategory = await callWordpress(session, `/categories?slug=${RPAE_INTERNAL_CATEGORY_SLUG}`);
    const internalId =
      internalCategory.ok && Array.isArray(internalCategory.data) ? internalCategory.data[0]?.id : undefined;
    if (isInternalRpaeUsage(meta.usage) || (internalId && post.categories.includes(internalId))) {
      return NextResponse.json(
        { error: "Article à usage interne ou sur commande : il ne peut pas être publié sur le site." },
        { status: 400 },
      );
    }
  }

  const payload: Record<string, unknown> =
    action === "publier"
      ? { status: "publish", dnpec_log_action: "publier" }
      : { status: "draft", dnpec_log_action: "rejeter" };
  if (action === "publier" && isRefusedRpae(raw)) payload.content = withoutRejectMarkers(raw);
  if (action === "rejeter" && !isRefusedRpae(raw)) payload.content = `${raw}\n${RPAE_REFUSE_MARKER}`;

  const result = await callWordpress(session, `/posts/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!result.ok) return errorResponse(result);
  revalidateContent({ type: "post", rpae: true, slug: (result.data as { slug?: string }).slug });
  return NextResponse.json(result.data);
}
