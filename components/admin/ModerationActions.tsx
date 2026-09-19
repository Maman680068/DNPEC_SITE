"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ModerationActionsProps = {
  apiPath: string;
  status: string;
  canModerate: boolean;
};

/**
 * Boutons "Publier" / "Rejeter" affichés uniquement pour les administrateurs
 * sur un contenu en attente ou en brouillon (validation d'une soumission de
 * contributeur). Chaque action envoie `dnpec_log_action` au serveur
 * WordPress, qui inscrit l'événement dans le journal des validations.
 */
export default function ModerationActions({ apiPath, status, canModerate }: ModerationActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<"publier" | "rejeter" | null>(null);
  const [error, setError] = useState("");

  if (!canModerate || (status !== "pending" && status !== "draft")) {
    return null;
  }

  async function runAction(action: "publier" | "rejeter") {
    if (action === "rejeter" && !window.confirm("Rejeter ce contenu ? Il ne sera pas publié sur le site.")) {
      return;
    }
    setPending(action);
    setError("");
    try {
      const res = await fetch(apiPath, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action === "publier" ? "publish" : "trash",
          dnpec_log_action: action,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Action impossible.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action impossible.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => runAction("publier")}
        disabled={pending !== null}
        className="text-xs font-semibold px-3 h-8 rounded-md bg-green text-white hover:bg-green-dark transition-colors disabled:opacity-60"
      >
        {pending === "publier" ? "…" : "Publier"}
      </button>
      <button
        type="button"
        onClick={() => runAction("rejeter")}
        disabled={pending !== null}
        className="text-xs font-semibold px-3 h-8 rounded-md bg-red/10 text-red hover:bg-red/20 transition-colors disabled:opacity-60"
      >
        {pending === "rejeter" ? "…" : "Rejeter"}
      </button>
      {error && <span className="text-red text-xs">{error}</span>}
    </div>
  );
}
