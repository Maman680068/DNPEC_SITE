"use client";

import { useMemo, useState } from "react";
import { useMessages } from "@/lib/i18n/use-locale";
import type { Messages } from "@/lib/i18n/messages";

type Status = "idle" | "submitting" | "success" | "error";
type ProfilKey = keyof Messages["rpae"]["profils"];
type ProfilValue = ProfilKey | "";

const fieldClasses = "h-11 px-4 rounded-md border border-line bg-paper text-sm font-normal";
const labelClasses = "flex flex-col gap-1.5 text-sm text-navy font-semibold";
const textareaClasses =
  "min-h-[120px] px-4 py-3 rounded-md border border-line bg-paper text-sm font-normal resize-y";

const PROFIL_KEYS: ProfilKey[] = ["etudiant", "expert", "docteur", "professeur", "autre"];

type ProfileFieldsConfig = {
  hint: string;
  grade: { label: string; placeholder: string; required: boolean };
  secondary: { label: string; placeholder: string; required: boolean };
  extra?: { name: "encadrant"; label: string; placeholder: string };
};

function profileFields(t: Messages["rpae"], profil: ProfilKey): ProfileFieldsConfig {
  const configs: Record<ProfilKey, ProfileFieldsConfig> = {
    etudiant: {
      hint: t.etudiantHint,
      grade: { label: t.etudiantGrade, placeholder: t.etudiantGradePh, required: true },
      secondary: { label: t.etudiantSecondary, placeholder: t.etudiantSecondaryPh, required: true },
      extra: { name: "encadrant", label: t.etudiantExtra, placeholder: t.etudiantExtraPh },
    },
    expert: {
      hint: t.expertHint,
      grade: { label: t.expertGrade, placeholder: t.expertGradePh, required: false },
      secondary: { label: t.expertSecondary, placeholder: t.expertSecondaryPh, required: true },
    },
    docteur: {
      hint: t.docteurHint,
      grade: { label: t.docteurGrade, placeholder: t.docteurGradePh, required: true },
      secondary: { label: t.docteurSecondary, placeholder: t.docteurSecondaryPh, required: true },
    },
    professeur: {
      hint: t.professeurHint,
      grade: { label: t.professeurGrade, placeholder: t.professeurGradePh, required: true },
      secondary: { label: t.professeurSecondary, placeholder: t.professeurSecondaryPh, required: true },
    },
    autre: {
      hint: t.autreHint,
      grade: { label: t.autreGrade, placeholder: t.autreGradePh, required: true },
      secondary: { label: t.autreSecondary, placeholder: t.autreSecondaryPh, required: true },
    },
  };
  return configs[profil];
}

function RequiredMark() {
  return (
    <span className="text-red font-bold ml-0.5" aria-hidden="true">
      *
    </span>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span>
      {children}
      {required ? <RequiredMark /> : null}
    </span>
  );
}

export default function RpaeSubmissionForm() {
  const messages = useMessages();
  const t = messages.rpae;
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [profil, setProfil] = useState<ProfilValue>("");
  const [usage, setUsage] = useState<"publication" | "interne" | "commande">("publication");
  const [submittedUsage, setSubmittedUsage] = useState<"publication" | "interne" | "commande">("publication");

  const profileConfig = useMemo(
    () => (profil ? profileFields(t, profil) : null),
    [profil, t],
  );

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
      setSubmittedUsage(
        data?.usage === "interne" || data?.usage === "commande" ? data.usage : "publication",
      );
      setStatus("success");
      setFileName(null);
      setProfil("");
      setUsage("publication");
      form.reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error && error.message !== "request failed" ? error.message : t.genericError,
      );
    }
  }

  if (status === "success") {
    const isPublic = submittedUsage === "publication";
    return (
      <div className="bg-white rounded-lg border border-line p-6 flex flex-col gap-3 text-sm text-navy">
        <p className="font-semibold text-base">{t.successTitle}</p>
        <p>
          {isPublic ? t.successPublic : t.successInternal} {t.contactBack}
        </p>
      </div>
    );
  }

  const usageOptions = [
    { value: "publication" as const, label: t.usagePublication, hint: t.usagePublicationHint },
    { value: "interne" as const, label: t.usageInternal, hint: t.usageInternalHint },
    { value: "commande" as const, label: t.usageCommission, hint: t.usageCommissionHint },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-line p-6 flex flex-col gap-4">
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label htmlFor="site_web">Site web</label>
        <input id="site_web" name="site_web" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <p className="text-[13px] text-muted leading-relaxed -mt-1 mb-1">{t.requiredHint}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className={labelClasses}>
          <FieldLabel required>{t.lastName}</FieldLabel>
          <input required name="nom" type="text" className={fieldClasses} />
        </label>
        <label className={labelClasses}>
          <FieldLabel required>{t.firstName}</FieldLabel>
          <input required name="prenom" type="text" className={fieldClasses} />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className={labelClasses}>
          <FieldLabel required>{t.email}</FieldLabel>
          <input required name="email" type="email" className={fieldClasses} />
        </label>
        <label className={labelClasses}>
          <FieldLabel>{t.phone}</FieldLabel>
          <input name="telephone" type="tel" className={fieldClasses} />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className={labelClasses}>
          <FieldLabel required>{t.nationality}</FieldLabel>
          <input required name="nationalite" type="text" className={fieldClasses} />
        </label>
        <label className={labelClasses}>
          <FieldLabel required>{t.profile}</FieldLabel>
          <select
            required
            name="profil"
            value={profil}
            onChange={(e) => setProfil(e.target.value as ProfilValue)}
            className={fieldClasses}
          >
            <option value="" disabled>
              {t.selectProfile}
            </option>
            {PROFIL_KEYS.map((key) => (
              <option key={key} value={key}>
                {t.profils[key]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {profileConfig ? (
        <div className="rounded-lg border border-navy/15 bg-navy/[0.03] p-4 flex flex-col gap-4">
          <p className="text-[13px] text-muted leading-relaxed">{profileConfig.hint}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={labelClasses}>
              <FieldLabel required={profileConfig.grade.required}>{profileConfig.grade.label}</FieldLabel>
              <input
                key={`grade-${profil}`}
                required={profileConfig.grade.required}
                name="grade"
                type="text"
                placeholder={profileConfig.grade.placeholder}
                className={fieldClasses}
              />
            </label>
            <label className={labelClasses}>
              <FieldLabel required={profileConfig.secondary.required}>
                {profileConfig.secondary.label}
              </FieldLabel>
              <input
                key={`fonction-${profil}`}
                required={profileConfig.secondary.required}
                name="fonction"
                type="text"
                placeholder={profileConfig.secondary.placeholder}
                className={fieldClasses}
              />
            </label>
          </div>

          {profileConfig.extra ? (
            <label className={labelClasses}>
              <FieldLabel>{profileConfig.extra.label}</FieldLabel>
              <input
                key={`extra-${profil}`}
                name={profileConfig.extra.name}
                type="text"
                placeholder={profileConfig.extra.placeholder}
                className={fieldClasses}
              />
            </label>
          ) : null}
        </div>
      ) : (
        <p className="text-[13px] text-muted italic">{t.selectProfileHint}</p>
      )}

      <fieldset className="rounded-lg border border-line p-4">
        <legend className="text-sm text-navy font-semibold px-1">
          {t.destination}
          <RequiredMark />
        </legend>
        <p className="text-[13px] text-muted mb-3 mt-1">{t.destinationHint}</p>
        <div className="flex flex-col gap-2">
          {usageOptions.map((option) => (
            <label
              key={option.value}
              className={`flex gap-3 items-start rounded-md border px-3 py-2.5 cursor-pointer transition-colors ${
                usage === option.value ? "border-navy bg-navy/[0.04]" : "border-line bg-paper"
              }`}
            >
              <input
                type="radio"
                name="usage"
                value={option.value}
                checked={usage === option.value}
                onChange={() => setUsage(option.value)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm text-navy font-semibold">{option.label}</span>
                <span className="block text-[12px] text-muted mt-0.5">{option.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className={labelClasses}>
          <FieldLabel required>{t.theme}</FieldLabel>
          <input
            required
            name="theme"
            type="text"
            placeholder={t.themePlaceholder}
            className={fieldClasses}
          />
        </label>
        <label className={labelClasses}>
          <FieldLabel required>{t.edition}</FieldLabel>
          <input
            required
            name="edition"
            type="text"
            placeholder={t.editionPlaceholder}
            className={fieldClasses}
          />
        </label>
      </div>

      <label className={labelClasses}>
        <FieldLabel required>{t.title}</FieldLabel>
        <input required name="titreArticle" type="text" className={fieldClasses} />
      </label>

      <label className={labelClasses}>
        <FieldLabel required>{t.abstract}</FieldLabel>
        <textarea
          required
          name="resume"
          rows={5}
          maxLength={2000}
          placeholder={t.abstractPlaceholder}
          className={textareaClasses}
        />
      </label>

      <div className="rounded-lg border-2 border-dashed border-navy/40 bg-navy/[0.05] p-5 sm:p-6">
        <p className="text-sm text-navy font-bold mb-1">
          {t.fileLabel}
          <RequiredMark />
        </p>
        <p className="text-[13px] text-muted mb-4">{t.fileFormats}</p>

        <label className="flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer">
          <span className="inline-flex items-center justify-center gap-2 bg-navy text-white font-bold text-sm px-5 h-11 rounded-lg hover:bg-navy-dark transition-colors shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {fileName ? t.changeFile : t.addFile}
          </span>
          <input
            required
            name="file"
            type="file"
            accept=".docx,.xlsx"
            className="block w-full max-w-md text-sm text-navy file:hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>

        {fileName ? (
          <p className="mt-3 text-sm text-navy font-medium break-all">
            {t.selectedFile} <span className="font-semibold">{fileName}</span>
          </p>
        ) : (
          <p className="mt-3 text-[13px] text-muted">{t.noFile}</p>
        )}
      </div>

      {status === "error" && <p className="text-red text-sm font-medium">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "submitting" || !profil}
        className="self-start bg-red text-white font-bold text-sm px-7 h-12 rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? t.sending : t.submit}
      </button>
    </form>
  );
}
