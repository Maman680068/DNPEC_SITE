import type { NextRequest } from "next/server";
import { getNews, getRecentPublicationCards } from "@/lib/wordpress";

export const runtime = "nodejs";

type SearchResult = { title: string; href: string; type: "Actualité" | "Publication" | "Page" };

// Pages institutionnelles statiques (titre + route) — recherche par titre
// uniquement, sans appel réseau supplémentaire.
const STATIC_PAGES: { title: string; href: string }[] = [
  { title: "La DNPEC", href: "/la-dnpec" },
  { title: "Mot du Directeur National", href: "/la-dnpec/mot-du-directeur" },
  { title: "Historique", href: "/la-dnpec/historique" },
  { title: "Mission", href: "/la-dnpec/mission" },
  { title: "Cabinet", href: "/la-dnpec/cabinet" },
  { title: "Textes réglementaires", href: "/la-dnpec/textes-reglementaires" },
  { title: "Organigramme", href: "/organigramme" },
  { title: "Contact", href: "/contact" },
  { title: "Écrire au Directeur National", href: "/ecrire-au-directeur-national" },
  { title: "Revue Scientifique (RPAE)", href: "/revue-scientifique" },
  { title: "Soumettre un article RPAE", href: "/revue-scientifique/soumettre" },
  { title: "Quelques chiffres", href: "/quelques-chiffres" },
  { title: "Données", href: "/donnees" },
  { title: "Conférences & Séminaires", href: "/conferences-seminaires" },
  { title: "Actualités", href: "/actualites" },
  { title: "Publications", href: "/publications" },
  { title: "Loi des finances", href: "/loi-des-finances" },
  { title: "Code des marchés publics", href: "/code-des-marches-publics" },
  { title: "Code des investissements", href: "/code-des-investissements" },
  { title: "Code général des impôts", href: "/code-general-des-impots" },
  { title: "Code minier", href: "/code-minier" },
  { title: "Documents budgétaires", href: "/publications/documents-budgetaires" },
  { title: "Documents conjoncturels", href: "/publications/documents-conjoncturels" },
  { title: "Documents d'analyse et d'études économiques", href: "/publications/documents-analyses-etudes" },
  { title: "Documents de politique économique", href: "/documents-politique-economique" },
  { title: "Documents statistiques", href: "/documents-statistiques" },
  { title: "Documents de travail", href: "/documents-travail" },
  { title: "Documents de suivi de l'intégration économique régionale", href: "/documents-integration-regionale" },
  { title: "TBMEG — Tableau de Bord Mensuel de l'Économie Guinéenne", href: "/tbmeg" },
  { title: "TBFP — Tableau de Bord Finances Publiques", href: "/tbfp" },
  { title: "TOFE — Tableau des Opérations Financières de l'État", href: "/tofe" },
  { title: "Rapport régional de conjoncture (RRC)", href: "/rapport-regional-conjoncture" },
  { title: "Note hebdomadaire de l'économie guinéenne", href: "/note-hebdomadaire-economie-guineenne" },
  { title: "Note de conjoncture économique de la Guinée", href: "/note-conjoncture-economique-guinee" },
  { title: "Autres notes techniques", href: "/autres-notes-techniques" },
  { title: "Rapport CPIA", href: "/rapport-cpia" },
  { title: "Rapport économique et financier (REF)", href: "/rapport-economique-financier" },
  { title: "Note trimestrielle d'analyse économique", href: "/note-trimestrielle-analyse-economique" },
  { title: "Mentions légales", href: "/mentions-legales" },
];

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ");
}

function matches(haystack: string, query: string): boolean {
  return haystack.toLowerCase().includes(query.toLowerCase());
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!query) {
    return Response.json({ results: [] });
  }

  const [news, publications] = await Promise.all([getNews(), getRecentPublicationCards()]);

  const results: SearchResult[] = [
    ...news
      .filter(
        (article) =>
          matches(article.title, query) ||
          matches(article.excerpt, query) ||
          (article.content && matches(stripHtml(article.content), query)),
      )
      .map((article) => ({ title: article.title, href: `/actualites/${article.slug}`, type: "Actualité" as const })),
    ...publications
      .filter((pub) => matches(pub.title, query))
      .map((pub) => ({ title: pub.title, href: pub.href, type: "Publication" as const })),
    ...STATIC_PAGES.filter((page) => matches(page.title, query)).map((page) => ({ ...page, type: "Page" as const })),
  ];

  return Response.json({ results: results.slice(0, 30) });
}
