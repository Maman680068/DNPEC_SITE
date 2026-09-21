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
import { canPublishDirectly } from "@/lib/admin/constants";

export const runtime = "nodejs";

const REFUSE_MARKER = "<!-- rpae:statut-soumission refuse -->";

type RouteParams = { params: Promise<{ id: string }> };
type ActionInput = { action?: "publier" | "rejeter" };

/**
 * Publier ou rejeter un article RPAE — toujours soumis à validation
 * manuelle par principe (voir docs/RPAE-WORDPRESS.md), donc réservé aux
 * personnes ayant le droit de publier directement, quel que soit le
 * contenu d'origine.
 *
 * "Rejeter" suit exactement le workflow déjà documenté pour le comité
 * WordPress : statut "draft" + marqueur <!-- rpae:statut-soumission refuse -->
 * ajouté au contenu (jamais de suppression), pour rester cohérent avec un
 * rejet effectué directement depuis wp-admin.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const originError = requireTrustedOrigin(request);
  if (originError) return originError;

  const { id } = await params;
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  if (!canPublishDirectly(session.roles)) {
    return NextResponse.json(
      { error: "Seul un administrateur peut valider ou rejeter un article de la revue scientifique." },
      { status: 403 },
    );
  }

  const body = await parseJsonBody<ActionInput>(request);
  if (body?.action !== "publier" && body?.action !== "rejeter") {
    return NextResponse.json({ error: "Action invalide." }, { status: 400 });
  }

  const payload: Record<string, unknown> = { dnpec_log_action: body.action };

  if (body.action === "publier") {
    payload.status = "publish";
  } else {
    // Contenu brut (context=edit) requis : reprendre le contenu déjà
    // rendu (wpautop etc.) et le renvoyer tel quel le déformerait un peu
    // plus à chaque rejet.
    const currentRes = await wordpressAuthedFetch(`/posts/${id}?context=edit`, session.token);
    const current = await readWordpressJson(currentRes);
    if (!current.ok) return NextResponse.json({ error: current.error }, { status: current.status });

    const contentField = (current.data as { content?: { raw?: string; rendered?: string } }).content;
    const currentContent = contentField?.raw ?? contentField?.rendered ?? "";

    payload.status = "draft";
    payload.content = currentContent.includes(REFUSE_MARKER)
      ? currentContent
      : `${currentContent}\n${REFUSE_MARKER}`;
  }

  const res = await wordpressAuthedFetch(`/posts/${id}`, session.token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await readWordpressJson(res);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.data);
}
