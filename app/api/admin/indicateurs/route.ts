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

type IndicateurInput = {
  title?: string; // libellé — mappé sur post_title côté WordPress
  value?: string;
  icon?: string;
  tone?: string;
  period?: string;
};

export async function POST(request: NextRequest) {
  const originError = requireTrustedOrigin(request);
  if (originError) return originError;

  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const body = await parseJsonBody<IndicateurInput>(request);
  if (!body?.title?.trim()) {
    return NextResponse.json({ error: "Le libellé est obligatoire." }, { status: 400 });
  }

  const res = await wordpressAuthedFetch("/indicateurs", session.token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await readWordpressJson(res);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.data, { status: 201 });
}
