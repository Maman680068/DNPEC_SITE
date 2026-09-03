import type { NextRequest } from "next/server";
import { getNews, getPublishedRpaeArticles, getRecentPublicationCards } from "@/lib/wordpress";
import { localizeHref } from "@/lib/i18n/href";
import { messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/config";

export const runtime = "nodejs";

type SearchResult = { title: string; href: string; type: string };

// Pages institutionnelles statiques (titre + route) — recherche par titre
// uniquement, sans appel réseau supplémentaire.
const STATIC_PAGES: { title: string; href: string }[] = [
  { title: "La DNPEC", href: "/la-dnpec" },
  { title: "Mot du Directeur National", href: "/la-dnpec/mot-du-directeur" },
  { title: "Historique", href: "/la-dnpec/historique" },
  { title: "Mission", href: "/la-dnpec/mission" },
  { title: "Équipe dirigeante", href: "/la-dnpec/cabinet" },
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
  { title: "Documents prévisionnels", href: "/publications/documents-previsionnels" },
  { title: "Transition fiscale", href: "/transition-fiscale" },
  {
    title: "PEF — Perspectives économiques et financières",
    href: "/perspectives-economiques-financieres",
  },
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
  const locale: Locale = request.nextUrl.searchParams.get("lang") === "en" ? "en" : "fr";
  const t = messages[locale];

  const [news, publications, rpaeArticles] = await Promise.all([
    getNews(locale),
    getRecentPublicationCards(locale),
    getPublishedRpaeArticles(),
  ]);

  const staticPages = STATIC_PAGES.map((page) => ({
    ...page,
    title: t.nav[page.href] ?? page.title,
  }));

  const results: SearchResult[] = [
    ...news
      .filter(
        (article) =>
          matches(article.title, query) ||
          matches(article.excerpt, query) ||
          (article.content && matches(stripHtml(article.content), query)),
      )
      .map((article) => ({
        title: article.title,
        href: localizeHref(locale, `/actualites/${article.slug}`),
        type: t.search.typeNews as SearchResult["type"],
      })),
    ...publications
      .filter((pub) => matches(pub.title, query))
      .map((pub) => ({
        title: pub.title,
        href: localizeHref(locale, pub.href),
        type: t.search.typePublication as SearchResult["type"],
      })),
    ...rpaeArticles
      .filter(
        (article) =>
          matches(article.title, query) ||
          matches(article.auteur, query) ||
          matches(article.theme, query) ||
          matches(article.resume, query),
      )
      .map((article) => ({
        title: article.title,
        href: localizeHref(locale, `/revue-scientifique/${article.slug}`),
        type: t.search.typeRpae as SearchResult["type"],
      })),
    ...staticPages
      .filter((page) => matches(page.title, query) || matches(t.nav[page.href] ?? "", query))
      .map((page) => ({
        title: page.title,
        href: localizeHref(locale, page.href),
        type: t.search.typePage as SearchResult["type"],
      })),
  ];

  return Response.json({ results: results.slice(0, 30) });
}
