"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FileUploadField from "@/components/admin/FileUploadField";

const fieldClasses = "h-11 px-4 rounded-md border border-line bg-paper text-sm font-normal";
const labelClasses = "flex flex-col gap-1.5 text-sm text-navy font-semibold";

const TYPE_OPTIONS = [
  { value: "previsionnels", label: "Documents prévisionnels" },
  { value: "budgetaires", label: "Documents budgétaires" },
  { value: "conjoncturels", label: "Documents conjoncturels" },
  { value: "integration-regionale", label: "Documents de suivi de l'intégration économique régionale" },
  { value: "politique-economique", label: "Documents de politique économique" },
  { value: "analyses-etudes", label: "Documents d'analyse et d'études économiques" },
  { value: "travail", label: "Documents de travail" },
  { value: "statistiques", label: "Documents statistiques" },
];

type PublicationFormProps = {
  mode: "create" | "edit";
  id?: string;
  canPublishDirectly: boolean;
  initialData?: {
    title: string;
    description?: string;
    type?: string;
    year?: number;
    fileUrl?: string;
    href?: string;
  };
};

export default function PublicationForm({ mode, id, canPublishDirectly, initialData }: PublicationFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [type, setType] = useState(initialData?.type ?? TYPE_OPTIONS[0].value);
  const [year, setYear] = useState(String(initialData?.year ?? new Date().getFullYear()));
  const [fileUrl, setFileUrl] = useState(initialData?.fileUrl ?? "");
  const [href, setHref] = useState(initialData?.href ?? "");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch(mode === "create" ? "/api/admin/publications" : `/api/admin/publications/${id}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          type,
          year: Number(year),
          fileUrl,
          href,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Enregistrement impossible.");
      router.push("/espace-contributeurs/publications");
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
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="px-4 py-3 rounded-md border border-line bg-paper text-sm font-normal resize-y"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className={labelClasses}>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)} className={fieldClasses}>
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClasses}>
          Année
          <input
            required
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={fieldClasses}
          />
        </label>
      </div>

      <FileUploadField label="Fichier PDF (optionnel)" accept="application/pdf" onUploaded={(result) => setFileUrl(result?.url ?? "")} />
      {fileUrl && <p className="text-xs text-muted break-all">Fichier actuel : {fileUrl}</p>}

      <label className={labelClasses}>
        Lien de destination (optionnel, sinon /publications/{"{"}identifiant{"}"})
        <input value={href} onChange={(e) => setHref(e.target.value)} className={fieldClasses} />
      </label>

      {status === "error" && <p className="text-red text-sm font-medium">{errorMessage}</p>}

      <div className="flex flex-col gap-2">
        {mode === "create" && !canPublishDirectly && (
          <p className="text-[13px] text-muted leading-relaxed">
            Cette publication sera enregistrée en attente et publiée après validation par un administrateur.
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
