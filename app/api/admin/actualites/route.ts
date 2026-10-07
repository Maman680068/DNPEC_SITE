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
import { checkSelectableCategory } from "@/lib/admin/actualites";
import { revalidateContent } from "@/lib/revalidate-content";

export const runtime = "nodejs";

type ActualiteInput = {
  title?: unknown;
  excerpt?: unknown;
  content?: unknown;
  categoryId?: unknown;
  featuredMediaId?: unknown;
};

export async function POST(request: NextRequest) {
  const originError = requireTrustedOrigin(request);
  if (originError) return originError;
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const body = await parseJsonBody<ActualiteInput>(request);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "Le titre est obligatoire." }, { status: 400 });

  // Statut décidé par le serveur selon les droits confirmés par WordPress, jamais par le navigateur.
  const confirmed = await confirmWordpressUser(session);
  if (!confirmed.ok) return confirmed.response;
  const status = confirmed.user.capabilities.publish_posts ? "publish" : "pending";

  const payload: Record<string, unknown> = {
    title,
    excerpt: typeof body?.excerpt === "string" ? body.excerpt : "",
    content: typeof body?.content === "string" ? body.content : "",
    status,
  };

  const categoryId = Number(body?.categoryId);
  if (Number.isInteger(categoryId) && categoryId > 0) {
    const check = await checkSelectableCategory(session, categoryId);
    if (!check.ok) return check.expired ? sessionExpiredResponse() : NextResponse.json({ error: check.error }, { status: 400 });
    payload.categories = [categoryId];
  }
  const featuredMediaId = Number(body?.featuredMediaId);
  if (Number.isInteger(featuredMediaId) && featuredMediaId > 0) payload.featured_media = featuredMediaId;

  const result = await callWordpress(session, "/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!result.ok) return errorResponse(result);
  const post = result.data as { slug?: string; status?: string };
  if (post.status === "publish") revalidateContent({ type: "post", slug: post.slug });
  return NextResponse.json(post, { status: 201 });
}
