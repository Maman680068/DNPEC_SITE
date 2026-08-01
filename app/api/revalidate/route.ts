import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

/**
 * Slugs WordPress (wp/v2/pages) actuellement branchés sur une route du site,
 * via InstitutionalPage (voir components/la-dnpec/InstitutionalPage.tsx) —
 * à tenir synchronisé avec chaque nouvel appel `<InstitutionalPage slug=... />`
 * dans app/. Pas de génération automatique : peu de pages, changent rarement,
 * une liste explicite reste plus simple à auditer qu'une extraction dynamique.
 */
const PAGE_SLUG_TO_ROUTE: Record<string, string> = {
  tbfp: "/tbfp",
  "documents-politique-economique": "/documents-politique-economique",
  "documents-travail": "/documents-travail",
  "rapport-economique-et-financier-ref": "/rapport-economique-financier",
  cabinet: "/la-dnpec/cabinet",
  historique: "/la-dnpec/historique",
  mission: "/la-dnpec/mission",
  "mot-du-directeur-national": "/la-dnpec/mot-du-directeur",
  "rapport-regional-conjoncture": "/rapport-regional-conjoncture",
  "loi-des-finances": "/loi-des-finances",
  "note-conjoncture-economique-guinee": "/note-conjoncture-economique-guinee",
  "note-hebdomadaire-economie-guineenne": "/note-hebdomadaire-economie-guineenne",
  tofe: "/tofe",
  "code-des-marches-publics": "/code-des-marches-publics",
  "code-des-investissements": "/code-des-investissements",
  "documents-integration-regionale": "/documents-integration-regionale",
  "autres-etudes-economiques": "/autres-etudes-economiques",
  "note-trimestrielle-analyse-economique": "/note-trimestrielle-analyse-economique",
  "code-general-des-impots": "/code-general-des-impots",
  "autres-notes-techniques": "/autres-notes-techniques",
  "tableau-de-bord-mensuel-de-leconomie-guineenne-tbmeg": "/tbmeg",
  "code-minier": "/code-minier",
  "rapport-cpia-comite-devaluation-des-politiques-et-institutions-nationales": "/rapport-cpia",
  "documents-statistiques": "/documents-statistiques",
  "rapports-analyses-etudes": "/rapports-analyses-etudes",
};

/**
 * Sous-ensemble des slugs ci-dessus repris dans le carrousel de la page
 * d'accueil (cf. PUBLICATION_PAGES dans lib/wordpress.ts) — leur modification
 * doit donc aussi revalider "/", pas seulement leur propre route.
 */
const HOMEPAGE_LINKED_SLUGS = new Set([
  "tableau-de-bord-mensuel-de-leconomie-guineenne-tbmeg",
  "tbfp",
  "tofe",
  "rapport-regional-conjoncture",
  "note-hebdomadaire-economie-guineenne",
  "note-conjoncture-economique-guinee",
  "autres-notes-techniques",
  "documents-integration-regionale",
  "documents-politique-economique",
  "rapports-analyses-etudes",
  "rapport-cpia-comite-devaluation-des-politiques-et-institutions-nationales",
  "rapport-economique-et-financier-ref",
  "note-trimestrielle-analyse-economique",
  "autres-etudes-economiques",
  "documents-travail",
  "documents-statistiques",
]);

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

  const { type, slug } = (body ?? {}) as { type?: string; slug?: string };

  if (type === "post") {
    const paths = ["/actualites", "/"];
    if (slug) paths.push(`/actualites/${slug}`);
    for (const path of paths) revalidatePath(path);
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
    const paths = [route];
    if (slug && HOMEPAGE_LINKED_SLUGS.has(slug)) paths.push("/");
    for (const path of paths) revalidatePath(path);
    return Response.json({ revalidated: true, paths });
  }

  return Response.json(
    { revalidated: false, error: `Type "${type}" non reconnu — attendu "post" ou "page".` },
    { status: 400 },
  );
}
