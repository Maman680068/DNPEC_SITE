"use client";

import { useState } from "react";
import { useMessages } from "@/lib/i18n/use-locale";

type Status = "idle" | "submitting" | "success" | "error";

export default function Newsletter() {
  const t = useMessages();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "request failed");
      }
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error && error.message !== "request failed" ? error.message : t.newsletter.error,
      );
    }
  }

  return (
    <div className="wrap">
      <div className="newsletter relative grid grid-cols-1 md:grid-cols-[56%_44%] rounded-[10px] overflow-hidden my-14 bg-navy">
        <div className="nl-left bg-green text-white p-6 md:p-8 md:pl-8 md:pr-12 lg:p-11 lg:pl-10 lg:pr-[120px] relative z-10">
          <h2 className="text-white text-xl md:text-[26px] mb-3 max-w-[290px] whitespace-pre-line">
            {t.newsletter.heading}
          </h2>
          <p className="text-[13.5px] text-[#d7f0e2] max-w-[300px]">{t.newsletter.body}</p>
        </div>
        <div className="bg-navy p-6 md:p-8 md:pl-14 md:pr-8 lg:p-11 lg:pl-[110px] lg:pr-10 flex flex-col justify-center gap-3.5">
          {status === "success" ? (
            <p className="text-white text-sm">{t.newsletter.success}</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3 flex-col lg:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t.newsletter.email}
                className="w-full lg:flex-1 border-none rounded-lg px-5 text-base h-14 bg-white text-ink"
              />
              <button
                type="submit"
                disabled={status === "submitting"}
                className="bg-red text-white border-none px-7.5 rounded-lg font-bold text-base cursor-pointer h-14 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "submitting" ? t.newsletter.sending : t.newsletter.submit}
              </button>
            </form>
          )}
          {status === "error" && <p className="text-[#ff8a80] text-sm font-medium">{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
}
