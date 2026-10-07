import type { NextRequest } from "next/server";
import { createContent, PUBLICATION_KIND } from "@/lib/admin/content-routes";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return createContent(request, PUBLICATION_KIND);
}
