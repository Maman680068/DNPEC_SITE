"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FileUploadField from "@/components/admin/FileUploadField";

const fieldClasses = "h-11 px-4 rounded-md border border-line bg-paper text-sm font-normal";
const labelClasses = "flex flex-col gap-1.5 text-sm text-navy font-semibold";

type PartenaireFormProps = {
  mode: "create" | "edit";
  id?: string;
  canPublishDirectly: boolean;
  initialData?: {
    name: string;
    websiteUrl?: string;
    logoUrl?: string;
  };
};

export default function PartenaireForm({ mode, id, canPublishDirectly, initialData }: PartenaireFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.websiteUrl ?? "");
  const [featuredMediaId, setFeaturedMediaId] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const body: Record<string, unknown> = { title: name, websiteUrl };
    if (featuredMediaId) body.featuredMediaId = featuredMediaId;

    try {
      const res = await fetch(mode === "create" ? "/api/admin/partenaires" : `/api/admin/partenaires/${id}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Enregistrement impossible.");
      router.push("/espace-contributeurs/partenaires");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Enregistrement impossible.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-line p-6 flex flex-col gap-4 max-w-lg">
      <label className={labelClasses}>
        Nom
        <input required value={name} onChange={(e) => setName(e.target.value)} className={fieldClasses} />
      </label>

      <label className={labelClasses}>
        Site web (optionnel)
        <input
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          className={fieldClasses}
          placeholder="https://…"
        />
      </label>

      <FileUploadField
        label="Logo (optionnel)"
        accept="image/*"
        initialUrl={initialData?.logoUrl}
        onUploaded={(result) => setFeaturedMediaId(result?.id ?? null)}
      />

      {status === "error" && <p className="text-red text-sm font-medium">{errorMessage}</p>}

      <div className="flex flex-col gap-2">
        {mode === "create" && !canPublishDirectly && (
          <p className="text-[13px] text-muted leading-relaxed">
            Ce partenaire sera enregistré en attente et publié après validation par un administrateur.
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
