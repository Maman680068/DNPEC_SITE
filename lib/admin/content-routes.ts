import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  callWordpress,
  confirmWordpressUser,
  errorResponse,
  isErrorResponse,
  parseJsonBody,
  requireSession,
  requireTrustedOrigin,
  userCanModerate,
} from "./api-helpers";
import { revalidateContent, type RevalidationTarget } from "@/lib/revalidate-content";

/**
 * Routes de l'espace contributeurs pour les contenus du mu-plugin
 * (publications, partenaires) : le navigateur n'envoie que des champs
 * autorisés ou une action (publier / rejeter). Le statut est décidé par
 * WordPress selon les droits de la personne (voir wordpress/mu-plugins).
 */

export type ContentKind = {
  /** Route WordPress (wp/v2/…) */
  path: "publications" | "partenaires";
  /** Champs acceptés depuis le formulaire, et leur type. */
  fields: Record<string, "string" | "int">;
  revalidate: (item: { slug?: string; status?: string }) => RevalidationTarget;
  requiredField: { name: string; message: string };
};

function pickFields(body: Record<string, unknown>, fields: ContentKind["fields"]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [name, type] of Object.entries(fields)) {
    if (!(name in body) || body[name] === undefined) continue;
    const value = body[name];
    if (type === "int") {
      const n = Number(value);
      if (value !== null && value !== "" && Number.isFinite(n)) out[name] = Math.trunc(n);
    } else if (typeof value === "string") {
      out[name] = value;
    }
  }
  return out;
}

export async function createContent(request: NextRequest, kind: ContentKind): Promise<NextResponse> {
  const originError = requireTrustedOrigin(request);
  if (originError) return originError;
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const body = await parseJsonBody<Record<string, unknown>>(request);
  const payload = pickFields(body ?? {}, kind.fields);
  const required = payload[kind.requiredField.name];
  if (typeof required !== "string" || !required.trim()) {
    return NextResponse.json({ error: kind.requiredField.message }, { status: 400 });
  }

  const result = await callWordpress(session, `/${kind.path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!result.ok) return errorResponse(result);
  const item = result.data as { slug?: string; status?: string };
  if (item.status === "publish") revalidateContent(kind.revalidate(item));
  return NextResponse.json(item, { status: 201 });
}

export async function updateContent(request: NextRequest, kind: ContentKind, id: string): Promise<NextResponse> {
  const originError = requireTrustedOrigin(request);
  if (originError) return originError;
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const body = await parseJsonBody<Record<string, unknown>>(request);
  if (!body) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  const payload = pickFields(body, kind.fields);
  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "Aucune modification à enregistrer." }, { status: 400 });
  }

  const result = await callWordpress(session, `/${kind.path}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!result.ok) return errorResponse(result);
  const item = result.data as { slug?: string; status?: string };
  if (item.status === "publish") revalidateContent(kind.revalidate(item));
  return NextResponse.json(item);
}

export async function moderateContent(request: NextRequest, kind: ContentKind, id: string): Promise<NextResponse> {
  const originError = requireTrustedOrigin(request);
  if (originError) return originError;
  const session = await requireSession();
  if (isErrorResponse(session)) return session;

  const body = await parseJsonBody<{ action?: unknown }>(request);
  const action = body?.action;
  if (action !== "publier" && action !== "rejeter") {
    return NextResponse.json({ error: "Action invalide." }, { status: 400 });
  }

  const confirmed = await confirmWordpressUser(session);
  if (!confirmed.ok) return confirmed.response;
  if (!userCanModerate(confirmed.user)) {
    return NextResponse.json(
      { error: "Seul un administrateur ou un éditeur peut publier ou rejeter ce contenu." },
      { status: 403 },
    );
  }

  const result = await callWordpress(session, `/${kind.path}/${encodeURIComponent(id)}/moderation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!result.ok) return errorResponse(result);
  revalidateContent(kind.revalidate(result.data as { slug?: string }));
  return NextResponse.json(result.data);
}

export const PUBLICATION_KIND: ContentKind = {
  path: "publications",
  fields: { title: "string", description: "string", type: "string", year: "int", fileUrl: "string", fileSizeKb: "int" },
  revalidate: (item) => ({ type: "publication", slug: item.slug }),
  requiredField: { name: "title", message: "Le titre est obligatoire." },
};

export const PARTENAIRE_KIND: ContentKind = {
  path: "partenaires",
  fields: { title: "string", websiteUrl: "string", featuredMediaId: "int" },
  revalidate: () => ({ type: "partenaire" }),
  requiredField: { name: "title", message: "Le nom est obligatoire." },
};
