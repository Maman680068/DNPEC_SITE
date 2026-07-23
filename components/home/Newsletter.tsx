"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitted">("idle");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    // TODO: brancher sur l'API d'inscription newsletter (double opt-in) du
    // WordPress headless une fois disponible — voir README.
    setStatus("submitted");
  }

  return (
    <div className="wrap">
      <div className="newsletter relative grid grid-cols-1 md:grid-cols-[56%_44%] rounded-[10px] overflow-hidden my-14 bg-navy">
        <div className="nl-left bg-green text-white p-11 md:pl-10 md:pr-[120px] relative z-10">
          <h2 className="text-white text-[26px] mb-3 max-w-[290px]">
            Restez à l&apos;affût
            <br />
            de l&apos;information
          </h2>
          <p className="text-[13.5px] text-[#d7f0e2] max-w-[300px]">
            Entrez votre adresse e-mail pour être informé des dernières publications de la DNPEC.
          </p>
        </div>
        <div className="bg-navy p-11 md:pl-[110px] md:pr-10 flex flex-col justify-center gap-3.5">
          {status === "submitted" ? (
            <p className="text-white text-sm">
              Merci ! Vérifiez votre boîte mail pour confirmer votre inscription.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3 flex-col sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Entrez votre adresse e-mail"
                className="flex-1 border-none rounded-lg px-5 text-base h-14 bg-white text-ink"
              />
              <button
                type="submit"
                className="bg-red text-white border-none px-7.5 rounded-lg font-bold text-base cursor-pointer h-14 whitespace-nowrap"
              >
                Souscrire
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
