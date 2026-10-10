import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { moderateContent, PUBLICATION_KIND } from "@/lib/admin/content-routes";
import { isNumericId } from "@/lib/admin/constants";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

/** Publier ou rejeter : { action: "publier" | "rejeter" }. */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  if (!isNumericId(id)) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  return moderateContent(request, PUBLICATION_KIND, id);
}
