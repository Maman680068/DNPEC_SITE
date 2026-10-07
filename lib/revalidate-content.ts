import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Slugs WordPress (wp/v2/pages) actuellement branchés sur une route du site,
 * via InstitutionalPage (voir components/la-dnpec/InstitutionalPage.tsx) —
 * à tenir synchronisé avec chaque nouvel appel `<InstitutionalPage slug=... />`
 * dans app/. Pas de génération automatique : peu de pages, changent rarement,
 * une liste explicite reste plus simple à auditer qu'une extraction dynamique.
 */
export const PAGE_SLUG_TO_ROUTE: Record<string, string> = {
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
export const HOMEPAGE_LINKED_SLUGS = new Set([
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

export type RevalidationTarget =
  | { type: "post"; slug?: string; rpae?: boolean }
  | { type: "page"; slug?: string }
  | { type: "publication"; slug?: string }
  | { type: "partenaire" };

/**
 * Rafraîchit les pages publiques après un changement de contenu WordPress :
 * appelé par le webhook /api/revalidate et par l'espace contributeurs après
 * une publication ou une modification. Renvoie les chemins revalidés, ou
 * null si une page WordPress n'est reliée à aucune route du site.
 */
export function revalidateContent(target: RevalidationTarget): string[] | null {
  // Données WordPress mises en cache par fetch (tag "wordpress", voir
  // lib/wordpress.ts) : la prochaine visite relit WordPress immédiatement.
  revalidateTag("wordpress", { expire: 0 });

  let paths: string[];
  if (target.type === "post") {
    paths = target.rpae ? ["/revue-scientifique"] : ["/actualites", "/"];
    if (target.slug) paths.push(target.rpae ? `/revue-scientifique/${target.slug}` : `/actualites/${target.slug}`);
  } else if (target.type === "page") {
    const route = target.slug ? PAGE_SLUG_TO_ROUTE[target.slug] : undefined;
    if (!route) return null;
    paths = [route];
    if (target.slug && HOMEPAGE_LINKED_SLUGS.has(target.slug)) paths.push("/");
  } else if (target.type === "publication") {
    paths = ["/publications"];
    if (target.slug) paths.push(`/publications/${target.slug}`);
  } else {
    paths = ["/"];
  }

  for (const path of paths) revalidatePath(path);
  return paths;
}
