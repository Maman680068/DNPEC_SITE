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

export const runtime = "nodejs";

type PartenaireInput = {
  title?: string; // nom — mappé sur post_title côté WordPress
  websiteUrl?: string;
  featuredMediaId?: number;
};

export async function POST(request: NextRequest) {
  const originError = requireTrustedOrigin(request);
  if (originError) return originError;

  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const body = await parseJsonBody<PartenaireInput>(request);
  if (!body?.title?.trim()) {
    return NextResponse.json({ error: "Le nom est obligatoire." }, { status: 400 });
  }

  const res = await wordpressAuthedFetch("/partenaires", session.token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await readWordpressJson(res);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.data, { status: 201 });
}
