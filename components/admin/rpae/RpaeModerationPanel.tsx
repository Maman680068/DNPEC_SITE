"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RpaeModerationPanelProps = {
  id: string;
  status: string;
};

export default function RpaeModerationPanel({ id, status }: RpaeModerationPanelProps) {
  const router = useRouter();
  const [pending, setPending] = useState<"publier" | "rejeter" | null>(null);
  const [error, setError] = useState("");

  async function runAction(action: "publier" | "rejeter") {
    if (action === "rejeter" && !window.confirm("Rejeter cet article ? Il ne sera pas publié dans la revue.")) {
      return;
    }
    setPending(action);
    setError("");
    try {
      const res = await fetch(`/api/admin/rpae/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
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
    <div className="bg-white rounded-lg border border-line p-5 flex flex-col gap-3">
      <p className="text-navy font-semibold text-sm">Décision du comité</p>
      <div className="flex flex-wrap gap-3">
        {status !== "publish" && (
          <button
            type="button"
            onClick={() => runAction("publier")}
            disabled={pending !== null}
            className="inline-flex items-center justify-center bg-green text-white font-bold text-sm px-6 h-11 rounded-lg hover:bg-green-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending === "publier" ? "Publication…" : "Publier"}
          </button>
        )}
        <button
          type="button"
          onClick={() => runAction("rejeter")}
          disabled={pending !== null}
          className="inline-flex items-center justify-center bg-red/10 text-red font-bold text-sm px-6 h-11 rounded-lg hover:bg-red/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending === "rejeter" ? "Rejet…" : "Rejeter"}
        </button>
      </div>
      {error && <p className="text-red text-sm font-medium">{error}</p>}
    </div>
  );
}
