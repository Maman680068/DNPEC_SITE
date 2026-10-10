import { decodeHtmlEntities } from "@/lib/decodeHtml";
import {
  parseRpaeMetadata,
  resolveArticleYear,
  authorDisplayName,
  profilLabel,
  isInternalRpaeUsage,
  RPAE_CATEGORY_SLUG,
  RPAE_INTERNAL_CATEGORY_SLUG,
  type RpaeSubmissionMeta,
} from "@/lib/rpae";
import { fetchAllPages, fetchCategories, withSession, type AdminResult, type WpPostRaw } from "./data";
import { isRefusedRpae } from "./markers";
import { wordpressAuthedFetch, isSessionRejected } from "./wordpress-auth";

/**
 * Couche de lecture RPAE pour l'espace contributeurs — contrairement au
 * catalogue public (lib/wordpress.ts, catégorie `rpae` publiée uniquement),
 * ici on lit TOUS les statuts et les deux catégories (`rpae` et
 * `rpae-interne`) : le comité doit pouvoir relire/valider/rejeter tout ce
 * qui a été soumis, y compris les travaux internes/sur commande.
 */

function stripHtml(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

export type AdminRpaeListItem = {
  id: string;
  title: string;
  auteur: string;
  profilLabel: string;
  theme: string;
  editionAnnee?: string;
  year: number;
  date: string;
  status: string;
  /** Brouillon portant le marqueur de refus du comité. */
  rejected: boolean;
  usage: string;
  /** Usage interne ou sur commande : jamais publié sur le site. */
  internal: boolean;
};

export type AdminRpaeDetail = AdminRpaeListItem & {
  meta: RpaeSubmissionMeta;
};

function mapPost(post: WpPostRaw): { item: AdminRpaeListItem; meta: RpaeSubmissionMeta } {
  // Métadonnées lues dans les commentaires rpae: — texte affiché par React, jamais injecté en HTML.
  const content = decodeHtmlEntities(post.content.raw ?? post.content.rendered);
  const meta = parseRpaeMetadata(content);
  const title = meta.titreArticle || stripHtml(post.title.rendered).replace(/^\[RPAE\]\s*/i, "").trim();
  const usage = meta.usage ?? "publication";

  return {
    item: {
      id: String(post.id),
      title,
      auteur: authorDisplayName(meta),
      profilLabel: profilLabel(meta.profilAuteur),
      theme: meta.theme ?? "Non renseigné",
      editionAnnee: meta.editionAnnee,
      year: resolveArticleYear(meta, post.date),
      date: post.date,
      status: post.status,
      rejected: post.status === "draft" && isRefusedRpae(content),
      usage,
      internal: isInternalRpaeUsage(usage),
    },
    meta,
  };
}

export function listRpaeSubmissions(): Promise<AdminResult<AdminRpaeListItem[]>> {
  return withSession(async (session) => {
    const categories = await fetchCategories(session);
    if (!categories.ok) return categories;
    const ids = categories.data
      .filter((c) => c.slug === RPAE_CATEGORY_SLUG || c.slug === RPAE_INTERNAL_CATEGORY_SLUG)
      .map((c) => c.id);
    if (ids.length === 0) return { ok: true, data: [] };

    const statusParams = ["publish", "pending", "draft"].map((s) => `status[]=${s}`).join("&");
    const posts = await fetchAllPages<WpPostRaw>(session, `/posts?categories=${ids.join(",")}&${statusParams}`);
    if (!posts.ok) return posts;

    return {
      ok: true,
      data: posts.data
        .map((post) => mapPost(post).item)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
  });
}

export function getRpaeSubmission(id: string): Promise<AdminResult<AdminRpaeDetail | null>> {
  return withSession(async (session) => {
    let res: Response;
    try {
      res = await wordpressAuthedFetch(`/posts/${encodeURIComponent(id)}?context=edit`, session.token);
    } catch {
      return { ok: false, expired: false, error: "Impossible de contacter le serveur WordPress." };
    }
    const body = (await res.json().catch(() => null)) as (WpPostRaw & { code?: string; message?: string }) | null;
    if (!res.ok) {
      if (isSessionRejected(res.status, body?.code)) return { ok: false, expired: true, error: "Session expirée." };
      if (res.status === 404) return { ok: true, data: null };
      return { ok: false, expired: false, error: `WordPress n'a pas pu fournir cet article (HTTP ${res.status}).` };
    }
    if (!body) return { ok: false, expired: false, error: "Réponse WordPress invalide." };
    const { item, meta } = mapPost(body);
    return { ok: true, data: { ...item, meta } };
  });
}
