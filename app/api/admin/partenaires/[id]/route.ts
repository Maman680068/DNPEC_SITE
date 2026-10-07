import type { NextRequest } from "next/server";
import { updateContent, PARTENAIRE_KIND } from "@/lib/admin/content-routes";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return updateContent(request, PARTENAIRE_KIND, id);
}
