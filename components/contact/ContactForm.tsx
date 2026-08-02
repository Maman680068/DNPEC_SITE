"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

type ContactFormProps = {
  /** Distingue l'objet de l'e-mail envoyé côté serveur — même route API, même destinataire pour l'instant. */
  context?: "contact" | "directeur-national";
  heading?: string;
  submitLabel?: string;
};

export default function ContactForm({ context = "contact", heading, submitLabel = "Envoyer" }: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          subject: formData.get("subject"),
          message: formData.get("message"),
          context,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "request failed");
      }

      setStatus("success");
      form.reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error && error.message !== "request failed"
          ? error.message
          : "Une erreur est survenue, merci de réessayer plus tard ou de nous contacter directement par téléphone.",
      );
    }
  }

  if (status === "success") {
    return (
      <p className="bg-white rounded-lg border border-line p-6 text-sm text-navy">
        Merci, votre message a bien été envoyé. La DNPEC vous répondra dans les meilleurs délais.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-line p-6 flex flex-col gap-4">
      {heading && <h2 className="text-navy text-lg font-bold font-heading">{heading}</h2>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-navy font-medium">
          Nom &amp; Prénom
          <input
            required
            name="name"
            type="text"
            className="h-11 px-4 rounded-md border border-line bg-paper text-sm font-normal"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-navy font-medium">
          Adresse e-mail
          <input
            required
            name="email"
            type="email"
            className="h-11 px-4 rounded-md border border-line bg-paper text-sm font-normal"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-navy font-medium">
          Téléphone
          <input
            name="phone"
            type="tel"
            className="h-11 px-4 rounded-md border border-line bg-paper text-sm font-normal"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-navy font-medium">
          Sujet
          <input
            required
            name="subject"
            type="text"
            className="h-11 px-4 rounded-md border border-line bg-paper text-sm font-normal"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm text-navy font-medium">
        Message
        <textarea
          required
          name="message"
          rows={6}
          className="px-4 py-3 rounded-md border border-line bg-paper text-sm font-normal resize-none"
        />
      </label>

      {status === "error" && <p className="text-red text-sm font-medium">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="self-start bg-red text-white font-bold text-sm px-7 h-12 rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Envoi en cours…" : submitLabel}
      </button>
    </form>
  );
}
