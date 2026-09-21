import { wordpressAuthedFetch } from "./wordpress-auth";

/**
 * Récupère l'ID d'une catégorie WordPress par son nom, ou la crée si elle
 * n'existe pas. Ressemble à ensureWpCategoryId (lib/rpae.ts) mais passe par
 * wordpressAuthedFetch pour inclure les en-têtes anti-pare-feu et le jeton
 * de la personne connectée.
 */
export async function ensureCategoryId(token: string, name: string): Promise<number | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const slug = trimmed
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  if (!slug) return null;

  try {
    const listRes = await wordpressAuthedFetch(`/categories?slug=${encodeURIComponent(slug)}`, token);
    if (listRes.ok) {
      const existing = (await listRes.json()) as { id: number }[];
      if (existing[0]?.id) return existing[0].id;
    }

    const createRes = await wordpressAuthedFetch("/categories", token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed, slug }),
    });
    if (!createRes.ok) return null;
    const created = (await createRes.json()) as { id?: number };
    return created.id ?? null;
  } catch {
    return null;
  }
}
