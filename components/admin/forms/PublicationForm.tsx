"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FileUploadField from "@/components/admin/FileUploadField";
import { adminFetch, jsonInit } from "@/components/admin/admin-fetch";
import { publicationTypes } from "@/lib/mock-data";

const fieldClasses = "h-11 px-4 rounded-md border border-line bg-paper text-sm font-normal";
const labelClasses = "flex flex-col gap-1.5 text-sm text-navy font-semibold";

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
    fileSizeKb?: number;
  };
};

/**
 * Seuls les champs repris par le site public : titre, description, type
 * (filtre de /publications), année et PDF (lien « Télécharger » de la page
 * de la publication).
 */
export default function PublicationForm({ mode, id, canPublishDirectly, initialData }: PublicationFormProps) {
  const router = useRouter();
  const initial = {
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    type: initialData?.type ?? publicationTypes[0].value,
    year: String(initialData?.year ?? new Date().getFullYear()),
    fileUrl: initialData?.fileUrl ?? "",
    fileSizeKb: initialData?.fileSizeKb,
  };
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [type, setType] = useState(initial.type);
  const [year, setYear] = useState(initial.year);
  const [file, setFile] = useState<{ url: string; sizeKb?: number }>({ url: initial.fileUrl, sizeKb: initial.fileSizeKb });
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const all: Record<string, unknown> = { title, description, type, year: Number(year), fileUrl: file.url };
    if (file.sizeKb) all.fileSizeKb = file.sizeKb;
    // En modification, seuls les champs changés sont envoyés.
    const body =
      mode === "create"
        ? all
        : Object.fromEntries(
            Object.entries(all).filter(([key, value]) => {
              const before = key === "year" ? Number(initial.year) : (initial as Record<string, unknown>)[key];
              return value !== before;
            }),
          );
    if (mode === "edit" && Object.keys(body).length === 0) {
      router.push("/espace-contributeurs/publications");
      return;
    }

    const result = await adminFetch(
      mode === "create" ? "/api/admin/publications" : `/api/admin/publications/${id}`,
      jsonInit(mode === "create" ? "POST" : "PUT", body),
    );
    if (!result.ok) {
      setStatus("error");
      setErrorMessage(result.error);
      return;
    }
    router.push("/espace-contributeurs/publications");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-line p-6 flex flex-col gap-4 max-w-2xl">
      <label className={labelClasses}>
        Titre
        <input id="publication-titre" required value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClasses} />
      </label>

      <label className={labelClasses}>
        Description
        <textarea
          id="publication-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="px-4 py-3 rounded-md border border-line bg-paper text-sm font-normal resize-y"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className={labelClasses}>
          Type
          <select id="publication-type" value={type} onChange={(e) => setType(e.target.value)} className={fieldClasses}>
            {publicationTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClasses}>
          Année
          <input
            id="publication-annee"
            required
            type="number"
            min={1958}
            max={2100}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={fieldClasses}
          />
        </label>
      </div>

      <FileUploadField
        label="Fichier PDF (optionnel)"
        accept="application/pdf"
        onUploading={setUploading}
        onUploaded={(result) => {
          if (result) setFile({ url: result.url, sizeKb: result.sizeKb });
        }}
      />
      {file.url && <p className="text-xs text-muted break-all">Fichier actuel : {file.url}</p>}

      {status === "error" && (
        <p role="alert" className="text-red text-sm font-medium">
          {errorMessage}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {mode === "create" && !canPublishDirectly && (
          <p className="text-[13px] text-muted leading-relaxed">
            Cette publication sera enregistrée en attente et publiée après validation par un administrateur.
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
