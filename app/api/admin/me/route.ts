import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { canModerate, canPublishDirectly } from "@/lib/admin/constants";
import { sessionExpiredResponse } from "@/lib/admin/api-helpers";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return sessionExpiredResponse();
  return NextResponse.json({
    name: session.name,
    roles: session.roles,
    canPublishDirectly: canPublishDirectly(session.roles),
    canModerate: canModerate(session.roles),
  });
}
