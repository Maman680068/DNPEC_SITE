"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch, jsonInit } from "@/components/admin/admin-fetch";

type ImportDefaultsButtonProps = {
  type: "publications" | "partenaires";
  /** Nombre d'éléments de la liste par défaut pas encore présents dans WordPress. */
  missing: number;
};

/**
 * Import unique (administrateur) de la liste affichée par défaut sur le site.
 * Sans lui, le premier élément saisi dans WordPress remplacerait toute cette
 * liste sur le site public.
 */
export default function ImportDefaultsButton({ type, missing }: ImportDefaultsButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const label = type === "publications" ? "publications" : "partenaires";

  if (missing === 0 && state === "idle") return null;

  async function run() {
    setState("running");
    const result = await adminFetch<{ created: number; skipped: number; errors: string[] }>(
      "/api/admin/import-defaults",
      jsonInit("POST", { type }),
    );
    if (!result.ok) {
      setState("error");
      setMessage(result.error);
      return;
    }
    const { created, errors } = result.data;
    setState(errors.length > 0 ? "error" : "done");
    setMessage(
      `${created} ${label} importé${created > 1 ? "s" : ""}.` + (errors.length > 0 ? ` Échecs : ${errors.join(" ; ")}` : ""),
    );
    router.refresh();
  }

  return (
    <div className="bg-white rounded-lg border border-line p-4 mb-5 flex flex-wrap items-center gap-3 justify-between">
      <p className="text-[13.5px] text-navy max-w-xl">
        Le site affiche encore la liste par défaut de {missing} {label}. Dès qu&apos;un élément existe dans WordPress, cette
        liste n&apos;est plus affichée : importez-la d&apos;abord pour ne rien perdre.
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={run}
          disabled={state === "running"}
          className="inline-flex items-center justify-center bg-navy text-white font-bold text-sm px-5 h-10 rounded-lg hover:bg-navy-dark disabled:opacity-60"
        >
          {state === "running" ? "Import…" : "Importer la liste par défaut"}
        </button>
        {message && (
          <span role="status" className={`text-xs ${state === "error" ? "text-red" : "text-green-dark"}`}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
