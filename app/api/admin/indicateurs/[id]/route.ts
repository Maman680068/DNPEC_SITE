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

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const originError = requireTrustedOrigin(request);
  if (originError) return originError;

  const { id } = await params;
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const body = await parseJsonBody<Record<string, unknown>>(request);
  if (!body) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  const res = await wordpressAuthedFetch(`/indicateurs/${id}`, session.token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await readWordpressJson(res);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.data);
}
