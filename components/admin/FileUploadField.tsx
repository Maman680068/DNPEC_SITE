"use client";

import { useState } from "react";
import { adminFetch } from "@/components/admin/admin-fetch";

const MAX_SIZE_BYTES = 8 * 1024 * 1024;

type UploadResult = { id: number; url: string; sizeKb?: number };

type FileUploadFieldProps = {
  label: string;
  accept?: string;
  onUploaded: (result: UploadResult | null) => void;
  /** Envoi en cours : le formulaire attend la fin avant d'enregistrer. */
  onUploading?: (uploading: boolean) => void;
  initialUrl?: string | null;
};

export default function FileUploadField({ label, accept, onUploaded, onUploading, initialUrl }: FileUploadFieldProps) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl ?? null);
  const [error, setError] = useState("");

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    if (file.size > MAX_SIZE_BYTES) {
      setStatus("error");
      setError("Fichier trop volumineux (8 Mo maximum).");
      onUploaded(null);
      return;
    }

    setStatus("uploading");
    onUploading?.(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await adminFetch<UploadResult>("/api/admin/media", { method: "POST", body: formData });
    onUploading?.(false);
    if (!result.ok) {
      setStatus("error");
      setError(result.error);
      onUploaded(null);
      return;
    }
    setPreviewUrl(result.data.url ?? null);
    setStatus("done");
    onUploaded(result.data);
  }

  return (
    <div className="flex flex-col gap-1.5 text-sm text-navy font-medium">
      <span>{label}</span>
      <label className="flex items-center gap-3 cursor-pointer">
        <span className="inline-flex items-center justify-center bg-navy text-white font-bold text-sm px-4 h-10 rounded-lg hover:bg-navy-dark transition-colors shrink-0">
          {status === "uploading" ? "Envoi…" : fileName ? "Changer de fichier" : "Choisir un fichier"}
        </span>
        <input type="file" accept={accept} className="sr-only" onChange={handleChange} />
        {fileName && <span className="text-xs text-muted truncate">{fileName}</span>}
        {status === "done" && <span className="text-xs text-green-dark font-semibold">Fichier envoyé</span>}
      </label>
      <span className="text-[12px] font-normal text-muted">8 Mo maximum.</span>
      {previewUrl && accept?.startsWith("image") && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="" className="mt-1 h-20 w-20 object-cover rounded-md border border-line" />
      )}
      {status === "error" && (
        <span role="alert" className="text-red text-xs">
          {error}
        </span>
      )}
    </div>
  );
}
