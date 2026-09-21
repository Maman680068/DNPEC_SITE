"use client";

import { useState } from "react";

type FileUploadFieldProps = {
  label: string;
  accept?: string;
  onUploaded: (result: { id: number; url: string } | null) => void;
  initialUrl?: string | null;
};

export default function FileUploadField({ label, accept, onUploaded, initialUrl }: FileUploadFieldProps) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl ?? null);
  const [error, setError] = useState("");

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setStatus("uploading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body: formData });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Envoi impossible.");
      setPreviewUrl(data.url ?? null);
      setStatus("done");
      onUploaded({ id: data.id, url: data.url });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Envoi impossible.");
      onUploaded(null);
    }
  }

  return (
    <div className="flex flex-col gap-1.5 text-sm text-navy font-medium">
      <span>{label}</span>
      <label className="flex items-center gap-3 cursor-pointer">
        <span className="inline-flex items-center justify-center bg-navy text-white font-bold text-sm px-4 h-10 rounded-lg hover:bg-navy-dark transition-colors shrink-0">
          {status === "uploading" ? "Envoi…" : fileName ? "Changer de fichier" : "Choisir un fichier"}
        </span>
        <input type="file" accept={accept} className="hidden" onChange={handleChange} />
        {fileName && <span className="text-xs text-muted truncate">{fileName}</span>}
      </label>
      {previewUrl && accept?.startsWith("image") && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="" className="mt-1 h-20 w-20 object-cover rounded-md border border-line" />
      )}
      {status === "error" && <span className="text-red text-xs">{error}</span>}
    </div>
  );
}
