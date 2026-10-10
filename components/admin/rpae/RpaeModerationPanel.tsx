"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch, jsonInit } from "@/components/admin/admin-fetch";

type RpaeModerationPanelProps = {
  id: string;
  status: string;
  rejected: boolean;
  /** Usage interne ou sur commande : jamais publié sur le site. */
  internal: boolean;
};

export default function RpaeModerationPanel({ id, status, rejected, internal }: RpaeModerationPanelProps) {
  const router = useRouter();
  const [pending, setPending] = useState<"publier" | "rejeter" | null>(null);
  const [confirmReject, setConfirmReject] = useState(false);
  const [error, setError] = useState("");

  async function runAction(action: "publier" | "rejeter") {
    setPending(action);
    setError("");
    const result = await adminFetch(`/api/admin/rpae/${id}/moderation`, jsonInit("POST", { action }));
    setPending(null);
    setConfirmReject(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="bg-white rounded-lg border border-line p-5 flex flex-col gap-3">
      <p className="text-navy font-semibold text-sm">Décision du comité</p>
      {internal && (
        <p className="text-[13px] text-muted">
          Article à usage interne ou sur commande : il ne peut pas être publié sur le site.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {status !== "publish" && !internal && (
          <button
            type="button"
            onClick={() => runAction("publier")}
            disabled={pending !== null}
            className="inline-flex items-center justify-center bg-green text-white font-bold text-sm px-6 h-11 rounded-lg hover:bg-green-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending === "publier" ? "Publication…" : "Publier"}
          </button>
        )}
        {!rejected &&
          (confirmReject ? (
            <>
              <span className="text-sm text-navy">Rejeter cet article ? Il ne sera pas publié dans la revue.</span>
              <button
                type="button"
                onClick={() => runAction("rejeter")}
                disabled={pending !== null}
                className="inline-flex items-center justify-center bg-red text-white font-bold text-sm px-5 h-11 rounded-lg disabled:opacity-60"
              >
                {pending === "rejeter" ? "Rejet…" : "Oui, rejeter"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmReject(false)}
                className="inline-flex items-center justify-center bg-line text-navy font-semibold text-sm px-5 h-11 rounded-lg"
              >
                Annuler
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReject(true)}
              disabled={pending !== null}
              className="inline-flex items-center justify-center bg-red/10 text-red font-bold text-sm px-6 h-11 rounded-lg hover:bg-red/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Rejeter
            </button>
          ))}
      </div>
      {error && (
        <p role="alert" className="text-red text-sm font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
