"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FileUploadField from "@/components/admin/FileUploadField";

const fieldClasses = "h-11 px-4 rounded-md border border-line bg-paper text-sm font-normal";
const labelClasses = "flex flex-col gap-1.5 text-sm text-navy font-semibold";

type ActualiteFormProps = {
  mode: "create" | "edit";
  id?: string;
  canPublishDirectly: boolean;
  initialData?: {
    title: string;
    excerpt: string;
    content: string;
    categoryName: string | null;
    coverImage: string | null;
  };
};

export default function ActualiteForm({ mode, id, canPublishDirectly, initialData }: ActualiteFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [categoryName, setCategoryName] = useState(initialData?.categoryName ?? "");
  const [featuredMediaId, setFeaturedMediaId] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const body: Record<string, unknown> = { title, excerpt, content, categoryName };
    if (featuredMediaId) body.featuredMediaId = featuredMediaId;

    try {
      const res = await fetch(mode === "create" ? "/api/admin/actualites" : `/api/admin/actualites/${id}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Enregistrement impossible.");
      router.push("/espace-contributeurs/actualites");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Enregistrement impossible.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-line p-6 flex flex-col gap-4 max-w-2xl">
      <label className={labelClasses}>
        Titre
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClasses} />
      </label>

      <label className={labelClasses}>
        Résumé (affiché dans les listes d&apos;actualités)
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          className="px-4 py-3 rounded-md border border-line bg-paper text-sm font-normal resize-y"
        />
      </label>

      <label className={labelClasses}>
        Contenu complet de l&apos;article
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="px-4 py-3 rounded-md border border-line bg-paper text-sm font-normal resize-y"
        />
      </label>

      <label className={labelClasses}>
        Catégorie
        <input
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className={fieldClasses}
          placeholder="ex. Conjoncture, International…"
        />
      </label>

      <FileUploadField
        label="Image à la une (optionnel)"
        accept="image/*"
        initialUrl={initialData?.coverImage}
        onUploaded={(result) => setFeaturedMediaId(result?.id ?? null)}
      />

      {status === "error" && <p className="text-red text-sm font-medium">{errorMessage}</p>}

      <div className="flex flex-col gap-2">
        {mode === "create" && !canPublishDirectly && (
          <p className="text-[13px] text-muted leading-relaxed">
            Votre article sera enregistré en brouillon et publié après validation par un administrateur.
          </p>
        )}
        <button
          type="submit"
          disabled={status === "submitting"}
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
