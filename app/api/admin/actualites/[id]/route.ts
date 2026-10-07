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
  sessionExpiredResponse,
} from "@/lib/admin/api-helpers";
import { checkSelectableCategory, isRpaePost, rpaeCategoryIdsFor, type WpPostEdit } from "@/lib/admin/actualites";
import { isRejectedActualite, withoutRejectMarkers } from "@/lib/admin/markers";
import { revalidateContent } from "@/lib/revalidate-content";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

/** Seuls les champs modifiés sont envoyés par le formulaire ; jamais de statut. */
type ActualiteUpdateInput = {
  title?: unknown;
  excerpt?: unknown;
  content?: unknown;
  categoryId?: unknown;
  /** Catégorie affichée au chargement du formulaire, remplacée par categoryId (les autres sont conservées). */
  previousCategoryId?: unknown;
  featuredMediaId?: unknown;
};

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const originError = requireTrustedOrigin(request);
  if (originError) return originError;
  const { id } = await params;
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const body = await parseJsonBody<ActualiteUpdateInput>(request);
  if (!body) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  const current = await callWordpress(session, `/posts/${encodeURIComponent(id)}?context=edit`);
  if (!current.ok) return errorResponse(current);
  const post = current.data as WpPostEdit;
  if (isRpaePost(post, await rpaeCategoryIdsFor(session))) {
    return NextResponse.json(
      { error: "Cet article appartient à la revue scientifique : il se gère depuis la page Revue scientifique." },
      { status: 400 },
    );
  }

  const payload: Record<string, unknown> = {};
  if (typeof body.title === "string") {
    if (!body.title.trim()) return NextResponse.json({ error: "Le titre est obligatoire." }, { status: 400 });
    payload.title = body.title;
  }
  if (typeof body.excerpt === "string") payload.excerpt = body.excerpt;
  if (typeof body.content === "string") payload.content = body.content;

  const featuredMediaId = Number(body.featuredMediaId);
  if (Number.isInteger(featuredMediaId) && featuredMediaId > 0) payload.featured_media = featuredMediaId;

  const categoryId = Number(body.categoryId);
  if (Number.isInteger(categoryId) && categoryId > 0) {
    const check = await checkSelectableCategory(session, categoryId);
    if (!check.ok) return check.expired ? sessionExpiredResponse() : NextResponse.json({ error: check.error }, { status: 400 });
    const previous = Number(body.previousCategoryId);
    // On remplace seulement la catégorie choisie dans la liste : les autres
    // (dont « English », qui marque une version anglaise) sont conservées.
    const kept = post.categories.filter((cat) => cat !== previous);
    payload.categories = Array.from(new Set([...kept, categoryId]));
  }

  // Un contributeur qui corrige son article rejeté le renvoie en relecture.
  const rawContent = typeof payload.content === "string" ? payload.content : (post.content.raw ?? "");
  if (post.status === "draft" && isRejectedActualite(post.content.raw ?? "")) {
    const confirmed = await confirmWordpressUser(session);
    if (!confirmed.ok) return confirmed.response;
    if (!confirmed.user.capabilities.publish_posts && post.author === confirmed.user.id) {
      payload.status = "pending";
      payload.content = withoutRejectMarkers(rawContent);
    }
  }

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "Aucune modification à enregistrer." }, { status: 400 });
  }

  const result = await callWordpress(session, `/posts/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!result.ok) return errorResponse(result);
  const updated = result.data as { slug?: string; status?: string };
  if (updated.status === "publish") revalidateContent({ type: "post", slug: updated.slug });
  return NextResponse.json(updated);
}
