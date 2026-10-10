"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FileUploadField from "@/components/admin/FileUploadField";
import { adminFetch, jsonInit } from "@/components/admin/admin-fetch";

const fieldClasses = "h-11 px-4 rounded-md border border-line bg-paper text-sm font-normal";
const labelClasses = "flex flex-col gap-1.5 text-sm text-navy font-semibold";

type Category = { id: number; name: string };

type ActualiteFormProps = {
  mode: "create" | "edit";
  id?: string;
  canPublishDirectly: boolean;
  /** Catégories existantes (un contributeur ne peut pas en créer). */
  categories: Category[];
  initialData?: {
    title: string;
    excerpt: string;
    /** Contenu brut (context=edit) tel qu'enregistré dans WordPress. */
    content: string;
    categoryId: number | null;
    coverImage: string | null;
  };
};

export default function ActualiteForm({ mode, id, canPublishDirectly, categories, initialData }: ActualiteFormProps) {
  const router = useRouter();
  const initialCategory = initialData?.categoryId ?? (mode === "create" ? (categories[0]?.id ?? null) : null);
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [categoryId, setCategoryId] = useState<number | null>(initialCategory);
  const [featuredMediaId, setFeaturedMediaId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    // En modification, seuls les champs changés sont envoyés : le reste de
    // l'article (et ses autres catégories, dont « English ») n'est pas touché.
    let body: Record<string, unknown>;
    if (mode === "create") {
      body = { title, excerpt, content, categoryId };
      if (featuredMediaId) body.featuredMediaId = featuredMediaId;
    } else {
      body = {};
      if (title !== initialData?.title) body.title = title;
      if (excerpt !== initialData?.excerpt) body.excerpt = excerpt;
      if (content !== initialData?.content) body.content = content;
      if (categoryId !== initialCategory && categoryId) {
        body.categoryId = categoryId;
        body.previousCategoryId = initialCategory;
      }
      if (featuredMediaId) body.featuredMediaId = featuredMediaId;
      if (Object.keys(body).length === 0) {
        router.push("/espace-contributeurs/actualites");
        return;
      }
    }

    const result = await adminFetch(
      mode === "create" ? "/api/admin/actualites" : `/api/admin/actualites/${id}`,
      jsonInit(mode === "create" ? "POST" : "PUT", body),
    );
    if (!result.ok) {
      setStatus("error");
      setErrorMessage(result.error);
      return;
    }
    router.push("/espace-contributeurs/actualites");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-line p-6 flex flex-col gap-4 max-w-2xl">
      <label className={labelClasses}>
        Titre
        <input id="actualite-titre" required value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClasses} />
      </label>

      <label className={labelClasses}>
        Résumé (affiché dans les listes d&apos;actualités)
        <textarea
          id="actualite-resume"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          className="px-4 py-3 rounded-md border border-line bg-paper text-sm font-normal resize-y"
        />
      </label>

      <label className={labelClasses}>
        Contenu complet de l&apos;article
        <textarea
          id="actualite-contenu"
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="px-4 py-3 rounded-md border border-line bg-paper text-sm font-normal resize-y"
        />
      </label>

      <label className={labelClasses}>
        Catégorie
        <select
          id="actualite-categorie"
          value={categoryId ?? ""}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
          className={fieldClasses}
        >
          {categoryId === null && <option value="">— Choisir —</option>}
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <span className="text-[12px] font-normal text-muted">
          Une catégorie manquante ? Demandez à un administrateur de la créer dans WordPress.
        </span>
      </label>

      <FileUploadField
        label="Image à la une (optionnel)"
        accept="image/jpeg,image/png,image/gif,image/webp"
        initialUrl={initialData?.coverImage}
        onUploading={setUploading}
        onUploaded={(result) => setFeaturedMediaId(result?.id ?? null)}
      />

      {status === "error" && (
        <p role="alert" className="text-red text-sm font-medium">
          {errorMessage}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {mode === "create" && !canPublishDirectly && (
          <p className="text-[13px] text-muted leading-relaxed">
            Votre article sera enregistré en attente et publié après validation par un administrateur.
          </p>
        )}
        <button
          type="submit"
          disabled={status === "submitting" || uploading}
          className="self-start bg-yellow text-navy-dark font-bold text-sm px-7 h-12 rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "submitting"
            ? "Enregistrement…"
            : mode === "edit"
              ? "Enregistrer les modifications"
              : canPublishDirectly
                ? "Publier"
                : "Soumettre pour validation"}
        </button>
      </div>
    </form>
  );
}
