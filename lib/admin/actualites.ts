import type { AdminSession } from "./session";
import { callWordpress } from "./api-helpers";
import { HIDDEN_CATEGORY_SLUGS } from "./data";
import { RPAE_CATEGORY_SLUG, RPAE_INTERNAL_CATEGORY_SLUG } from "@/lib/rpae";

/**
 * Outils des routes « actualités » de l'espace contributeurs : catégories
 * choisies dans une liste (un contributeur ne peut pas en créer), et
 * reconnaissance des articles de la revue scientifique, qui ont leur propre
 * circuit de validation.
 */

export type WpPostEdit = {
  id: number;
  slug: string;
  status: string;
  author: number;
  categories: number[];
  title: { raw?: string; rendered: string };
  content: { raw?: string; rendered: string };
};

/** Catégorie choisie dans le formulaire : doit exister et ne pas être une catégorie technique. */
export async function checkSelectableCategory(
  session: AdminSession,
  categoryId: number,
): Promise<{ ok: true } | { ok: false; error: string; expired: boolean }> {
  const result = await callWordpress(session, `/categories/${categoryId}`);
  if (!result.ok) {
    return result.expired
      ? { ok: false, error: result.error, expired: true }
      : { ok: false, error: "Catégorie inconnue.", expired: false };
  }
  const slug = (result.data as { slug?: string }).slug ?? "";
  if (HIDDEN_CATEGORY_SLUGS.has(slug)) {
    return { ok: false, error: "Cette catégorie ne peut pas être choisie ici.", expired: false };
  }
  return { ok: true };
}

/** Identifiants des catégories rpae / rpae-interne. */
export async function rpaeCategoryIdsFor(session: AdminSession): Promise<number[]> {
  const ids: number[] = [];
  for (const slug of [RPAE_CATEGORY_SLUG, RPAE_INTERNAL_CATEGORY_SLUG]) {
    const result = await callWordpress(session, `/categories?slug=${slug}`);
    if (result.ok && Array.isArray(result.data) && result.data[0]?.id) ids.push(result.data[0].id);
  }
  return ids;
}

export function isRpaePost(post: WpPostEdit, rpaeIds: number[]): boolean {
  if (post.categories.some((id) => rpaeIds.includes(id))) return true;
  if (/^\s*\[RPAE\]/i.test(post.title.raw ?? post.title.rendered)) return true;
  return /<!--\s*rpae:/i.test(post.content.raw ?? post.content.rendered);
}
