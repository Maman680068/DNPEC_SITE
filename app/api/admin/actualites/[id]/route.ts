import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  requireTrustedOrigin,
  requireSession,
  isErrorResponse,
  readWordpressJson,
  parseJsonBody,
} from "@/lib/admin/api-helpers";
import { wordpressAuthedFetch } from "@/lib/admin/wordpress-auth";
import { ensureCategoryId } from "@/lib/admin/actualites";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

type ActualiteUpdateInput = {
  title?: string;
  excerpt?: string;
  content?: string;
  categoryName?: string;
  featuredMediaId?: number;
  /** "publish" (publier), "pending" (remettre en attente), "trash" (rejeter) */
  status?: "publish" | "pending" | "draft" | "trash";
  /** Présent uniquement pour une action de modération explicite (voir Journal des validations). */
  dnpec_log_action?: "publier" | "rejeter";
};

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const originError = requireTrustedOrigin(request);
  if (originError) return originError;

  const { id } = await params;
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const body = await parseJsonBody<ActualiteUpdateInput>(request);
  if (!body) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  const payload: Record<string, unknown> = {};
  if (body.title !== undefined) payload.title = body.title;
  if (body.excerpt !== undefined) payload.excerpt = body.excerpt;
  if (body.content !== undefined) payload.content = body.content;
  if (body.status !== undefined) payload.status = body.status;
  if (body.featuredMediaId !== undefined) payload.featured_media = body.featuredMediaId;
  if (body.dnpec_log_action !== undefined) payload.dnpec_log_action = body.dnpec_log_action;

  if (body.categoryName) {
    const categoryId = await ensureCategoryId(session.token, body.categoryName);
    if (categoryId) payload.categories = [categoryId];
  }

  const res = await wordpressAuthedFetch(`/posts/${id}`, session.token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await readWordpressJson(res);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.data);
}
