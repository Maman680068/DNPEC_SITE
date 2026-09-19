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
import { canPublishDirectly } from "@/lib/admin/constants";

export const runtime = "nodejs";

type ActualiteInput = {
  title?: string;
  excerpt?: string;
  content?: string;
  categoryName?: string;
  featuredMediaId?: number;
};

export async function POST(request: NextRequest) {
  const originError = requireTrustedOrigin(request);
  if (originError) return originError;

  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const body = await parseJsonBody<ActualiteInput>(request);
  if (!body?.title?.trim()) {
    return NextResponse.json({ error: "Le titre est obligatoire." }, { status: 400 });
  }

  const categoryId = body.categoryName ? await ensureCategoryId(session.token, body.categoryName) : null;

  const payload: Record<string, unknown> = {
    title: body.title,
    excerpt: body.excerpt ?? "",
    content: body.content ?? "",
    status: canPublishDirectly(session.roles) ? "publish" : "pending",
  };
  if (categoryId) payload.categories = [categoryId];
  if (body.featuredMediaId) payload.featured_media = body.featuredMediaId;

  const res = await wordpressAuthedFetch("/posts", session.token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await readWordpressJson(res);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.data, { status: 201 });
}
