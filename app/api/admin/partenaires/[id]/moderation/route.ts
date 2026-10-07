import type { NextRequest } from "next/server";
import { moderateContent, PARTENAIRE_KIND } from "@/lib/admin/content-routes";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

/** Publier ou rejeter : { action: "publier" | "rejeter" }. */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return moderateContent(request, PARTENAIRE_KIND, id);
}
