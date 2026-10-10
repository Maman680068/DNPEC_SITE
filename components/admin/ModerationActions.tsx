"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch, jsonInit } from "@/components/admin/admin-fetch";

type ModerationActionsProps = {
  /** Route de modération, ex. /api/admin/actualites/12/moderation */
  apiPath: string;
  status: string;
  rejected?: boolean;
  /** Administrateur ou éditeur : seuls rôles autorisés à modérer le contenu des autres. */
  canModerate: boolean;
};

/**
 * Boutons « Publier » / « Rejeter » sur un contenu en attente ou en brouillon.
 * Le navigateur n'envoie que l'action : le statut et l'entrée du journal
 * sont décidés par le serveur à partir des droits confirmés par WordPress.
 */
export default function ModerationActions({ apiPath, status, rejected = false, canModerate }: ModerationActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<"publier" | "rejeter" | null>(null);
  const [confirmReject, setConfirmReject] = useState(false);
  const [error, setError] = useState("");

  if (!canModerate || (status !== "pending" && status !== "draft")) {
    return null;
  }

  async function runAction(action: "publier" | "rejeter") {
    setPending(action);
    setError("");
    const result = await adminFetch(apiPath, jsonInit("POST", { action }));
    setPending(null);
    setConfirmReject(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => runAction("publier")}
        disabled={pending !== null}
        className="text-xs font-semibold px-3 h-8 rounded-md bg-green text-white hover:bg-green-dark transition-colors disabled:opacity-60"
      >
        {pending === "publier" ? "Publication…" : "Publier"}
      </button>
      {!rejected &&
        (confirmReject ? (
          <>
            <span className="text-xs text-navy">Rejeter ce contenu ?</span>
            <button
              type="button"
              onClick={() => runAction("rejeter")}
              disabled={pending !== null}
              className="text-xs font-semibold px-3 h-8 rounded-md bg-red text-white hover:brightness-95 disabled:opacity-60"
            >
              {pending === "rejeter" ? "Rejet…" : "Oui, rejeter"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmReject(false)}
              disabled={pending !== null}
              className="text-xs font-semibold px-3 h-8 rounded-md bg-line text-navy"
            >
              Annuler
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReject(true)}
            disabled={pending !== null}
            className="text-xs font-semibold px-3 h-8 rounded-md bg-red/10 text-red hover:bg-red/20 transition-colors disabled:opacity-60"
          >
            Rejeter
          </button>
        ))}
      {error && (
        <span role="alert" className="text-red text-xs">
          {error}
        </span>
      )}
    </div>
  );
}
