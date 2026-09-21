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

type PublicationInput = {
  title?: string;
  description?: string;
  type?: string;
  year?: number;
  fileUrl?: string;
  fileSizeKb?: number;
  href?: string;
};

export async function POST(request: NextRequest) {
  const originError = requireTrustedOrigin(request);
  if (originError) return originError;

  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const body = await parseJsonBody<PublicationInput>(request);
  if (!body?.title?.trim()) {
    return NextResponse.json({ error: "Le titre est obligatoire." }, { status: 400 });
  }

  const res = await wordpressAuthedFetch("/publications", session.token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await readWordpressJson(res);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.data, { status: 201 });
}
