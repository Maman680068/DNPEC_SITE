import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { canPublishDirectly } from "@/lib/admin/constants";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  }
  return NextResponse.json({
    name: session.name,
    roles: session.roles,
    canPublishDirectly: canPublishDirectly(session.roles),
  });
}
