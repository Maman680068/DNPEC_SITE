"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const fieldClasses = "h-11 px-4 rounded-md border border-line bg-paper text-sm font-normal";
const labelClasses = "flex flex-col gap-1.5 text-sm text-navy font-semibold";

const TONE_OPTIONS = [
  { value: "green", label: "Vert" },
  { value: "yellow", label: "Jaune" },
  { value: "red", label: "Rouge" },
  { value: "navy", label: "Bleu marine" },
];

type IndicateurFormProps = {
  mode: "create" | "edit";
  id?: string;
  canPublishDirectly: boolean;
  initialData?: {
    label: string;
    value?: string;
    icon?: string;
    tone?: string;
    period?: string;
  };
};

export default function IndicateurForm({ mode, id, canPublishDirectly, initialData }: IndicateurFormProps) {
  const router = useRouter();
  const [label, setLabel] = useState(initialData?.label ?? "");
  const [value, setValue] = useState(initialData?.value ?? "");
  const [icon, setIcon] = useState(initialData?.icon ?? "");
  const [tone, setTone] = useState(initialData?.tone ?? "green");
  const [period, setPeriod] = useState(initialData?.period ?? "");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch(mode === "create" ? "/api/admin/indicateurs" : `/api/admin/indicateurs/${id}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: label, value, icon, tone, period }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Enregistrement impossible.");
      router.push("/espace-contributeurs/indicateurs");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Enregistrement impossible.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-line p-6 flex flex-col gap-4 max-w-lg">
      <label className={labelClasses}>
        Libellé
        <input
          required
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className={fieldClasses}
          placeholder="ex. Taux de croissance réel"
        />
      </label>

      <label className={labelClasses}>
        Valeur affichée
        <input
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={fieldClasses}
          placeholder="ex. 7,2 %"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className={labelClasses}>
          Icône (emoji, optionnel)
          <input value={icon} onChange={(e) => setIcon(e.target.value)} className={fieldClasses} placeholder="📈" />
        </label>
        <label className={labelClasses}>
          Couleur
          <select value={tone} onChange={(e) => setTone(e.target.value)} className={fieldClasses}>
            {TONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={labelClasses}>
        Période
        <input value={period} onChange={(e) => setPeriod(e.target.value)} className={fieldClasses} placeholder="ex. nov-2025" />
      </label>

      {status === "error" && <p className="text-red text-sm font-medium">{errorMessage}</p>}

      <div className="flex flex-col gap-2">
        {mode === "create" && !canPublishDirectly && (
          <p className="text-[13px] text-muted leading-relaxed">
            Cet indicateur sera enregistré en attente et publié après validation par un administrateur.
          </p>
        )}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="self-start bg-yellow text-navy-dark font-bold text-sm px-7 h-12 rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "submitting"
            ? "Enregistrement…"
            : mode === "edit"
              ? "Enregistrer les modifications"
              : canPublishDirectly
                ? "Publier"
                : "Soumettre pour validation"}
        </button>
      </div>
    </form>
  );
}
