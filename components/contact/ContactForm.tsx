"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitted">("idle");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    // TODO: brancher sur l'API d'envoi d'e-mail (vers infos@dnpec.gov.gn) une
    // fois le WordPress headless connecté — voir README.
    setStatus("submitted");
  }

  if (status === "submitted") {
    return (
      <p className="bg-white rounded-lg border border-line p-6 text-sm text-navy">
        Merci, votre message a bien été envoyé. La DNPEC vous répondra dans les meilleurs délais.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-line p-6 flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-navy font-medium">
          Nom complet
          <input
            required
            type="text"
            className="h-11 px-4 rounded-md border border-line bg-paper text-sm font-normal"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-navy font-medium">
          Adresse e-mail
          <input
            required
            type="email"
            className="h-11 px-4 rounded-md border border-line bg-paper text-sm font-normal"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm text-navy font-medium">
        Objet
        <input
          required
          type="text"
          className="h-11 px-4 rounded-md border border-line bg-paper text-sm font-normal"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-navy font-medium">
        Message
        <textarea
          required
          rows={6}
          className="px-4 py-3 rounded-md border border-line bg-paper text-sm font-normal resize-none"
        />
      </label>
      <button
        type="submit"
        className="self-start bg-red text-white font-bold text-sm px-7 h-12 rounded-lg cursor-pointer"
      >
        Envoyer le message
      </button>
    </form>
  );
}
