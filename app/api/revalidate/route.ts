import type { NextRequest } from "next/server";
import { PAGE_SLUG_TO_ROUTE, revalidateContent } from "@/lib/revalidate-content";

export const runtime = "nodejs";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) return false;
  const provided = request.nextUrl.searchParams.get("secret") ?? request.headers.get("x-webhook-secret");
  return provided === secret;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return Response.json({ revalidated: false, error: "Secret manquant ou invalide." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ revalidated: false, error: "Corps JSON invalide." }, { status: 400 });
  }

  // WP Webhooks (plugin WordPress Cozmoslabs) envoie l'objet WP_Post complet
  // sous body.post (post.post_type/post.post_name), pas à la racine — voir
  // sa doc pour le trigger "Post created"/"Post updated". On accepte aussi
  // le format minimal type/slug utilisé pour les tests manuels, prioritaire
  // si présent.
  const payload = (body ?? {}) as {
    type?: string;
    slug?: string;
    post?: { post_type?: string; post_name?: string };
  };
  const type = payload.type || payload.post?.post_type;
  const slug = payload.slug || payload.post?.post_name;

  if (!type) {
    return Response.json(
      {
        revalidated: false,
        error:
          'Aucun format reconnu dans le corps de la requête — ni {type, slug} ni {post: {post_type, post_name}} (format WP Webhooks).',
      },
      { status: 400 },
    );
  }

  if (type === "post") {
    const paths = revalidateContent({ type: "post", slug });
    return Response.json({ revalidated: true, paths });
  }

  if (type === "page") {
    const route = slug ? PAGE_SLUG_TO_ROUTE[slug] : undefined;
    if (!route) {
      return Response.json(
        {
          revalidated: false,
          error: slug
            ? `Slug de page "${slug}" non géré par le mapping automatique — ajoutez-le à PAGE_SLUG_TO_ROUTE dans app/api/revalidate/route.ts.`
            : 'Champ "slug" manquant pour type "page".',
          knownRoutes: Object.values(PAGE_SLUG_TO_ROUTE).sort(),
        },
        { status: 404 },
      );
    }
    const paths = revalidateContent({ type: "page", slug });
    return Response.json({ revalidated: true, paths });
  }

  return Response.json(
    { revalidated: false, error: `Type "${type}" non reconnu — attendu "post" ou "page".` },
    { status: 400 },
  );
}
