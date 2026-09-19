"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifiant, motDePasse }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Connexion impossible.");
      }
      const next = searchParams.get("next") || "/espace-contributeurs";
      router.push(next);
      router.refresh();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Connexion impossible.");
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-7">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white shadow-md mb-4">
            <Image
              src="/logos/logo-dnpec-clean.png"
              alt="DNPEC"
              width={64}
              height={64}
              className="w-full h-full object-contain p-1"
            />
          </div>
          <h1 className="text-white text-xl font-heading font-semibold text-center">
            Espace contributeurs
          </h1>
          <p className="text-[#c3cee0] text-sm mt-1 text-center">
            Connectez-vous avec votre compte WordPress DNPEC.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-line p-6 flex flex-col gap-4 shadow-xl"
        >
          <label className="flex flex-col gap-1.5 text-sm text-navy font-medium">
            Identifiant
            <input
              required
              autoFocus
              type="text"
              autoComplete="username"
              value={identifiant}
              onChange={(event) => setIdentifiant(event.target.value)}
              className="h-11 px-4 rounded-md border border-line bg-paper text-sm font-normal"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-navy font-medium">
            Mot de passe
            <input
              required
              type="password"
              autoComplete="current-password"
              value={motDePasse}
              onChange={(event) => setMotDePasse(event.target.value)}
              className="h-11 px-4 rounded-md border border-line bg-paper text-sm font-normal"
            />
          </label>

          {status === "error" && (
            <p className="text-red text-sm font-medium">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="mt-1 inline-flex items-center justify-center bg-yellow text-navy-dark font-bold text-sm h-12 rounded-lg hover:brightness-95 transition-[filter] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === "submitting" ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="text-[#c3cee0] text-xs text-center mt-5">
          Réservé aux membres de la DNPEC. Un problème de connexion ? Contactez l&apos;administrateur du site.
        </p>
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionForm />
    </Suspense>
  );
}
