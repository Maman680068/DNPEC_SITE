"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const GENERIC_ERROR_MESSAGE =
  "Une erreur est survenue, merci de réessayer plus tard ou de nous contacter directement par téléphone.";

const fieldClasses = "h-11 px-4 rounded-md border border-line bg-paper text-sm font-normal";
const labelClasses = "flex flex-col gap-1.5 text-sm text-navy font-medium";

export default function RpaeSubmissionForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/rpae-submission", { method: "POST", body: formData });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "request failed");
      }
      setStatus("success");
      form.reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error && error.message !== "request failed" ? error.message : GENERIC_ERROR_MESSAGE,
      );
    }
  }

  if (status === "success") {
    return (
      <p className="bg-white rounded-lg border border-line p-6 text-sm text-navy">
        Votre article a été reçu et sera examiné par notre comité scientifique.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-line p-6 flex flex-col gap-4">
      {/* Honeypot anti-spam : invisible, hors tabulation, jamais rempli par un humain. */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label htmlFor="site_web">Site web</label>
        <input id="site_web" name="site_web" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className={labelClasses}>
          Nom
          <input required name="nom" type="text" className={fieldClasses} />
        </label>
        <label className={labelClasses}>
          Prénom
          <input required name="prenom" type="text" className={fieldClasses} />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className={labelClasses}>
          Adresse e-mail
          <input required name="email" type="email" className={fieldClasses} />
        </label>
        <label className={labelClasses}>
          Téléphone
          <input name="telephone" type="tel" className={fieldClasses} />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className={labelClasses}>
          Nationalité
          <input required name="nationalite" type="text" className={fieldClasses} />
        </label>
        <label className={labelClasses}>
          Grade
          <input required name="grade" type="text" className={fieldClasses} />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className={labelClasses}>
          Fonction
          <input required name="fonction" type="text" className={fieldClasses} />
        </label>
        <label className={labelClasses}>
          Édition / Année RPAE
          <input required name="edition" type="text" className={fieldClasses} />
        </label>
      </div>

      <label className={labelClasses}>
        Intitulé de l&apos;article
        <input required name="titreArticle" type="text" className={fieldClasses} />
      </label>

      <label className={labelClasses}>
        Fichier de l&apos;article (.docx ou .xlsx, 10 Mo maximum)
        <input required name="file" type="file" accept=".docx,.xlsx" className="text-sm" />
      </label>

      {status === "error" && <p className="text-red text-sm font-medium">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="self-start bg-red text-white font-bold text-sm px-7 h-12 rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Envoi en cours…" : "Soumettre l'article"}
      </button>
    </form>
  );
}
