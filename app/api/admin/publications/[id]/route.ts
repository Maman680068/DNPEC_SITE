import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateContent, PUBLICATION_KIND } from "@/lib/admin/content-routes";
import { isNumericId } from "@/lib/admin/constants";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  if (!isNumericId(id)) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  return updateContent(request, PUBLICATION_KIND, id);
}
