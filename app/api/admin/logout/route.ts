import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clearAdminSession } from "@/lib/admin/session";
import { requireTrustedOrigin } from "@/lib/admin/api-helpers";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const originError = requireTrustedOrigin(request);
  if (originError) return originError;

  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
