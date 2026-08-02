"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";
type ProfilValue = (typeof RPAE_PROFILS)[number]["value"] | "";

const GENERIC_ERROR_MESSAGE =
  "Une erreur est survenue, merci de réessayer plus tard ou de nous contacter directement par téléphone.";

const fieldClasses = "h-11 px-4 rounded-md border border-line bg-paper text-sm font-normal";
const labelClasses = "flex flex-col gap-1.5 text-sm text-navy font-semibold";
const textareaClasses =
  "min-h-[120px] px-4 py-3 rounded-md border border-line bg-paper text-sm font-normal resize-y";

/** Profils auteur — classification demandée par la DNPEC pour le classement des publications. */
export const RPAE_PROFILS = [
  { value: "etudiant", label: "Étudiant(e)" },
  { value: "expert", label: "Expert / chercheur" },
  { value: "docteur", label: "Docteur" },
  { value: "professeur", label: "Professeur" },
  { value: "autre", label: "Autre" },
] as const;

type ProfileFieldsConfig = {
  hint: string;
  grade: { label: string; placeholder: string; required: boolean };
  /** Second champ profil-dépendant (établissement, fonction, affiliation…). */
  secondary: { label: string; placeholder: string; required: boolean };
  /** Champ optionnel supplémentaire (ex. encadrant pour étudiants). */
  extra?: { name: "encadrant"; label: string; placeholder: string };
};

const PROFILE_FIELDS: Record<(typeof RPAE_PROFILS)[number]["value"], ProfileFieldsConfig> = {
  etudiant: {
    hint: "Indiquez votre niveau d’études et votre établissement. Pas de fonction professionnelle requise.",
    grade: {
      label: "Niveau d’études",
      placeholder: "Ex. Licence 3, Master 1, Master 2…",
      required: true,
    },
    secondary: {
      label: "Établissement / université",
      placeholder: "Ex. Université Gamal Abdel Nasser de Conakry…",
      required: true,
    },
    extra: {
      name: "encadrant",
      label: "Encadrant / directeur de mémoire (si applicable)",
      placeholder: "Nom de l’encadrant",
    },
  },
  expert: {
    hint: "Précisez votre affiliation professionnelle ; le titre est facultatif.",
    grade: {
      label: "Titre / qualification",
      placeholder: "Ex. Économiste, chercheur associé…",
      required: false,
    },
    secondary: {
      label: "Fonction / affiliation",
      placeholder: "Ex. Analyste, consultant auprès de…",
      required: true,
    },
  },
  docteur: {
    hint: "Indiquez votre spécialité et votre fonction ou institution d’appartenance.",
    grade: {
      label: "Spécialité",
      placeholder: "Ex. Économie monétaire, finances publiques…",
      required: true,
    },
    secondary: {
      label: "Fonction / institution",
      placeholder: "Ex. Chercheur, enseignant-chercheur à…",
      required: true,
    },
  },
  professeur: {
    hint: "Indiquez votre grade académique et votre établissement.",
    grade: {
      label: "Grade académique",
      placeholder: "Ex. Maître de conférences, Professeur titulaire…",
      required: true,
    },
    secondary: {
      label: "Établissement / fonction",
      placeholder: "Ex. Université…, chef de département…",
      required: true,
    },
  },
  autre: {
    hint: "Décrivez votre parcours et votre situation actuelle.",
    grade: {
      label: "Grade / titre",
      placeholder: "Ex. titre, diplôme ou qualification…",
      required: true,
    },
    secondary: {
      label: "Fonction / situation",
      placeholder: "Ex. activité, structure d’appartenance…",
      required: true,
    },
  },
};

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
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [profil, setProfil] = useState<ProfilValue>("");
  const [usage, setUsage] = useState<"publication" | "interne" | "commande">("publication");
  const [submittedUsage, setSubmittedUsage] = useState<"publication" | "interne" | "commande">("publication");

  const profileConfig = profil ? PROFILE_FIELDS[profil] : null;

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
        error instanceof Error && error.message !== "request failed" ? error.message : GENERIC_ERROR_MESSAGE,
      );
    }
  }

  if (status === "success") {
    const isPublic = submittedUsage === "publication";
    return (
      <div className="bg-white rounded-lg border border-line p-6 flex flex-col gap-3 text-sm text-navy">
        <p className="font-semibold text-base">Votre article a bien été reçu.</p>
        <p>
          {isPublic
            ? "Il a été transmis au comité scientifique de la DNPEC (file WordPress « En attente de relecture »). Après analyse, la direction décidera de sa publication éventuelle dans la revue."
            : "Il a été transmis au comité pour usage interne ou travail sur commande. Ce travail ne sera pas publié automatiquement dans le catalogue public de la revue."}{" "}
          Vous serez recontacté(e) à l&apos;adresse e-mail indiquée.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-line p-6 flex flex-col gap-4">
      {/* Honeypot anti-spam : invisible, hors tabulation, jamais rempli par un humain. */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label htmlFor="site_web">Site web</label>
        <input id="site_web" name="site_web" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <p className="text-[13px] text-muted leading-relaxed -mt-1 mb-1">
        Les champs marqués d&apos;un <span className="text-red font-bold">*</span> sont obligatoires.
        Le formulaire s&apos;adapte au profil choisi pour classer votre contribution.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className={labelClasses}>
          <FieldLabel required>Nom</FieldLabel>
          <input required name="nom" type="text" className={fieldClasses} />
        </label>
        <label className={labelClasses}>
          <FieldLabel required>Prénom</FieldLabel>
          <input required name="prenom" type="text" className={fieldClasses} />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className={labelClasses}>
          <FieldLabel required>Adresse e-mail</FieldLabel>
          <input required name="email" type="email" className={fieldClasses} />
        </label>
        <label className={labelClasses}>
          <FieldLabel>Téléphone</FieldLabel>
          <input name="telephone" type="tel" className={fieldClasses} />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className={labelClasses}>
          <FieldLabel required>Nationalité</FieldLabel>
          <input required name="nationalite" type="text" className={fieldClasses} />
        </label>
        <label className={labelClasses}>
          <FieldLabel required>Profil</FieldLabel>
          <select
            required
            name="profil"
            value={profil}
            onChange={(e) => setProfil(e.target.value as ProfilValue)}
            className={fieldClasses}
          >
            <option value="" disabled>
              Sélectionnez votre profil
            </option>
            {RPAE_PROFILS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
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
        <p className="text-[13px] text-muted italic">
          Sélectionnez un profil pour afficher les champs adaptés (niveau d’études, établissement,
          fonction, etc.).
        </p>
      )}

      <fieldset className="rounded-lg border border-line p-4">
        <legend className="text-sm text-navy font-semibold px-1">
          Destination de la contribution
          <RequiredMark />
        </legend>
        <p className="text-[13px] text-muted mb-3 mt-1">
          Choisissez si l&apos;article vise le catalogue public de la revue, un usage interne DNPEC,
          ou un travail sur commande (ces deux derniers n&apos;apparaissent pas sur le site).
        </p>
        <div className="flex flex-col gap-2">
          {(
            [
              {
                value: "publication" as const,
                label: "Publication dans la revue",
                hint: "Après validation du comité, visible sur /revue-scientifique",
              },
              {
                value: "interne" as const,
                label: "Usage interne DNPEC",
                hint: "Analyse et exploitation interne — hors catalogue public",
              },
              {
                value: "commande" as const,
                label: "Travail sur commande",
                hint: "Commande institutionnelle / universitaire — hors catalogue public",
              },
            ] as const
          ).map((option) => (
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
          <FieldLabel required>Thème / domaine</FieldLabel>
          <input
            required
            name="theme"
            type="text"
            placeholder="Ex. inflation, finances publiques, conjoncture…"
            className={fieldClasses}
          />
        </label>
        <label className={labelClasses}>
          <FieldLabel required>Édition / Année RPAE</FieldLabel>
          <input required name="edition" type="text" placeholder="Ex. 2026" className={fieldClasses} />
        </label>
      </div>

      <label className={labelClasses}>
        <FieldLabel required>Intitulé de l&apos;article</FieldLabel>
        <input required name="titreArticle" type="text" className={fieldClasses} />
      </label>

      <label className={labelClasses}>
        <FieldLabel required>Résumé</FieldLabel>
        <textarea
          required
          name="resume"
          rows={5}
          maxLength={2000}
          placeholder="Présentez brièvement la problématique, la méthode et les principaux résultats (max. 2000 caractères)."
          className={textareaClasses}
        />
      </label>

      <div className="rounded-lg border-2 border-dashed border-navy/40 bg-navy/[0.05] p-5 sm:p-6">
        <p className="text-sm text-navy font-bold mb-1">
          Fichier de l&apos;article
          <RequiredMark />
        </p>
        <p className="text-[13px] text-muted mb-4">
          Formats acceptés : <strong className="text-navy font-semibold">.docx</strong> ou{" "}
          <strong className="text-navy font-semibold">.xlsx</strong> — taille max. 10 Mo
        </p>

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
            {fileName ? "Changer de fichier" : "Ajouter un fichier"}
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
            Fichier sélectionné : <span className="font-semibold">{fileName}</span>
          </p>
        ) : (
          <p className="mt-3 text-[13px] text-muted">Aucun fichier sélectionné pour le moment</p>
        )}
      </div>

      {status === "error" && <p className="text-red text-sm font-medium">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "submitting" || !profil}
        className="self-start bg-red text-white font-bold text-sm px-7 h-12 rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Envoi en cours…" : "Soumettre l'article"}
      </button>
    </form>
  );
}
