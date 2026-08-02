import type { NextRequest } from "next/server";
import { Resend } from "resend";
import { ensureRpaeCategoryId, ensureRpaeInternalCategoryId, profilLabel, usageLabel } from "@/lib/rpae";

export const runtime = "nodejs";

const GENERIC_ERROR_MESSAGE =
  "Une erreur est survenue, merci de réessayer plus tard ou de nous contacter directement par téléphone.";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 Mo
const MAX_RESUME_CHARS = 2000;
const ALLOWED_EXTENSIONS = [".docx", ".xlsx"];
const ALLOWED_PROFILS = new Set(["etudiant", "expert", "docteur", "professeur", "autre"]);
const ALLOWED_USAGES = new Set(["publication", "interne", "commande"]);

const ZIP_MAGIC_BYTES = [0x50, 0x4b, 0x03, 0x04];

const FROM_ADDRESS = process.env.CONTACT_FROM_EMAIL || "DNPEC — Site web <onboarding@resend.dev>";
// Destinataire comité RPAE — surcharge possible via RPAE_COMITE_EMAIL.
const COMITE_RECIPIENT = process.env.RPAE_COMITE_EMAIL || "soumah6868@gmail.com";

function log(reason: string, detail?: unknown) {
  console.warn(`[rpae-submission] ${reason}${detail ? ` — ${String(detail)}` : ""}`);
}

function hasZipSignature(bytes: Uint8Array): boolean {
  return ZIP_MAGIC_BYTES.every((byte, index) => bytes[index] === byte);
}

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot).toLowerCase();
}

function asTrimmedString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function sanitizeCommentValue(value: string): string {
  return value.replace(/-->/g, "—>").replace(/\r?\n/g, " ");
}

async function notifyComite(params: {
  titre: string;
  nom: string;
  prenom: string;
  email: string;
  profil: string;
  theme: string;
  edition: string;
  resume: string;
  fichierUrl: string;
  usage: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    log("RESEND_API_KEY absente, notification comité ignorée");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const isPublicTrack = params.usage === "publication";
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: COMITE_RECIPIENT,
      replyTo: params.email,
      subject: `[RPAE — à analyser] ${params.titre}`,
      text: [
        "Nouvelle soumission d'article scientifique (RPAE).",
        "",
        `Titre : ${params.titre}`,
        `Auteur : ${params.prenom} ${params.nom}`,
        `E-mail : ${params.email}`,
        `Profil : ${profilLabel(params.profil)}`,
        `Usage : ${usageLabel(params.usage)}`,
        `Thème : ${params.theme}`,
        `Édition / année : ${params.edition}`,
        "",
        "Résumé :",
        params.resume,
        "",
        params.fichierUrl ? `Fichier : ${params.fichierUrl}` : "Fichier : (URL non disponible)",
        "",
        isPublicTrack
          ? "Action WordPress : Articles → En attente de relecture → analyser, puis Publier (catalogue public) ou refuser."
          : "Action WordPress : catégorie « RPAE interne » — ne pas publier dans la catégorie publique RPAE.",
      ].join("\n"),
    });
    if (error) log("échec notification comité Resend", error.message);
  } catch (error) {
    log("exception notification comité", error);
  }
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const honeypot = formData.get("site_web");
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    log("honeypot rempli, rejet silencieux");
    return Response.json({ submitted: true });
  }

  const nom = asTrimmedString(formData.get("nom"));
  const prenom = asTrimmedString(formData.get("prenom"));
  const email = asTrimmedString(formData.get("email"));
  const telephone = asTrimmedString(formData.get("telephone")) ?? "";
  const nationalite = asTrimmedString(formData.get("nationalite"));
  const profil = asTrimmedString(formData.get("profil"));
  const grade = asTrimmedString(formData.get("grade")) ?? "";
  const fonction = asTrimmedString(formData.get("fonction")) ?? "";
  const encadrant = asTrimmedString(formData.get("encadrant")) ?? "";
  const theme = asTrimmedString(formData.get("theme"));
  const edition = asTrimmedString(formData.get("edition"));
  const titreArticle = asTrimmedString(formData.get("titreArticle"));
  const resume = asTrimmedString(formData.get("resume"));
  const usage = asTrimmedString(formData.get("usage")) ?? "publication";
  const file = formData.get("file");

  if (
    !nom ||
    !prenom ||
    !email ||
    !nationalite ||
    !profil ||
    !theme ||
    !edition ||
    !titreArticle ||
    !resume
  ) {
    return Response.json({ error: "Merci de remplir tous les champs obligatoires." }, { status: 400 });
  }

  if (!ALLOWED_PROFILS.has(profil)) {
    return Response.json({ error: "Le profil sélectionné n'est pas valide." }, { status: 400 });
  }

  if (!ALLOWED_USAGES.has(usage)) {
    return Response.json({ error: "Le type d'usage sélectionné n'est pas valide." }, { status: 400 });
  }

  // Champs profil-dépendants : un étudiant n'a pas de « fonction » pro,
  // mais un établissement ; un expert peut omettre le titre, etc.
  const gradeRequired = profil === "etudiant" || profil === "docteur" || profil === "professeur" || profil === "autre";
  const fonctionRequired = true; // établissement (étudiant) ou fonction / affiliation (autres)

  if ((gradeRequired && !grade) || (fonctionRequired && !fonction)) {
    return Response.json(
      { error: "Merci de renseigner les informations liées à votre profil (niveau, établissement ou fonction)." },
      { status: 400 },
    );
  }

  if (resume.length > MAX_RESUME_CHARS) {
    return Response.json(
      { error: `Le résumé ne doit pas dépasser ${MAX_RESUME_CHARS} caractères.` },
      { status: 400 },
    );
  }

  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Merci de joindre votre article (.docx ou .xlsx)." }, { status: 400 });
  }

  if (!ALLOWED_EXTENSIONS.includes(getExtension(file.name))) {
    return Response.json({ error: "Seuls les fichiers .docx et .xlsx sont acceptés." }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return Response.json({ error: "Le fichier dépasse la taille maximale autorisée (10 Mo)." }, { status: 400 });
  }

  const fileBytes = new Uint8Array(await file.arrayBuffer());
  if (!hasZipSignature(fileBytes)) {
    log("signature de fichier invalide", file.name);
    return Response.json({ error: "Le fichier joint n'est pas un document Word/Excel valide." }, { status: 400 });
  }

  const wpApiUrl = process.env.WORDPRESS_API_URL;
  const wpUser = process.env.WORDPRESS_APP_USER;
  const wpPassword = process.env.WORDPRESS_APP_PASSWORD;
  if (!wpApiUrl || !wpUser || !wpPassword) {
    log("identifiants WordPress absents, soumission impossible");
    return Response.json({ error: GENERIC_ERROR_MESSAGE }, { status: 503 });
  }

  const authHeader = `Basic ${Buffer.from(`${wpUser}:${wpPassword}`).toString("base64")}`;

  try {
    const mediaRes = await fetch(`${wpApiUrl}/media`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Disposition": `attachment; filename="${file.name}"`,
        "Content-Type": file.type || "application/octet-stream",
      },
      body: fileBytes,
    });

    if (!mediaRes.ok) {
      log("échec de l'upload média WordPress", `HTTP ${mediaRes.status}`);
      return Response.json({ error: GENERIC_ERROR_MESSAGE }, { status: 502 });
    }

    const media = (await mediaRes.json()) as { source_url?: string };
    const fichierUrl = media.source_url ?? "";
    const isPublicTrack = usage === "publication";
    const categoryId = isPublicTrack
      ? await ensureRpaeCategoryId(wpApiUrl, authHeader)
      : await ensureRpaeInternalCategoryId(wpApiUrl, authHeader);

    const statutMeta = isPublicTrack ? "soumis" : "interne";
    const processNote = isPublicTrack
      ? "Processus comité DNPEC (WordPress) : cet article est en « En attente de relecture ». Après analyse, Publier pour accepter (catalogue public), ou repasser en brouillon et indiquer <!-- rpae:statut-soumission refuse --> pour refuser."
      : "Usage interne / commande : catégorie « RPAE interne ». Ne pas publier dans la catégorie publique RPAE — ce travail n'apparaît pas sur /revue-scientifique.";

    const postContent = [
      `<!-- rpae:nom-auteur ${sanitizeCommentValue(nom)} -->`,
      `<!-- rpae:prenom-auteur ${sanitizeCommentValue(prenom)} -->`,
      `<!-- rpae:email-auteur ${sanitizeCommentValue(email)} -->`,
      `<!-- rpae:telephone-auteur ${sanitizeCommentValue(telephone)} -->`,
      `<!-- rpae:nationalite-auteur ${sanitizeCommentValue(nationalite)} -->`,
      `<!-- rpae:profil-auteur ${sanitizeCommentValue(profil)} -->`,
      grade ? `<!-- rpae:grade-auteur ${sanitizeCommentValue(grade)} -->` : "",
      fonction ? `<!-- rpae:fonction-auteur ${sanitizeCommentValue(fonction)} -->` : "",
      encadrant ? `<!-- rpae:encadrant ${sanitizeCommentValue(encadrant)} -->` : "",
      `<!-- rpae:usage ${sanitizeCommentValue(usage)} -->`,
      `<!-- rpae:theme ${sanitizeCommentValue(theme)} -->`,
      `<!-- rpae:edition-annee ${sanitizeCommentValue(edition)} -->`,
      `<!-- rpae:titre-article ${sanitizeCommentValue(titreArticle)} -->`,
      `<!-- rpae:resume ${sanitizeCommentValue(resume)} -->`,
      `<!-- rpae:fichier-url ${sanitizeCommentValue(fichierUrl)} -->`,
      `<!-- rpae:fichier-nom ${sanitizeCommentValue(file.name)} -->`,
      `<!-- rpae:statut-soumission ${statutMeta} -->`,
      "",
      "<h2>Résumé</h2>",
      `<p>${resume.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`,
      `<p><strong>Profil :</strong> ${profilLabel(profil)} — <strong>Usage :</strong> ${usageLabel(usage)} — <strong>Thème :</strong> ${theme.replace(/</g, "&lt;")}</p>`,
      `<p><strong>Auteur :</strong> ${prenom.replace(/</g, "&lt;")} ${nom.replace(/</g, "&lt;")} (${email.replace(/</g, "&lt;")})</p>`,
      fichierUrl
        ? `<p><a href="${fichierUrl}">Télécharger le fichier soumis (${file.name.replace(/</g, "&lt;")})</a></p>`
        : "",
      "",
      "<hr />",
      `<p><em>${processNote}</em></p>`,
    ].join("\n");

    const postBody: Record<string, unknown> = {
      title: `[RPAE] ${titreArticle}`,
      content: postContent,
      // "pending" = file WordPress « En attente de relecture » pour le comité.
      // Les usages internes restent aussi en pending pour analyse, mais hors catalogue.
      status: "pending",
    };
    if (categoryId) postBody.categories = [categoryId];

    const postRes = await fetch(`${wpApiUrl}/posts`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postBody),
    });

    if (!postRes.ok) {
      log("échec de la création du brouillon WordPress", `HTTP ${postRes.status}`);
      return Response.json({ error: GENERIC_ERROR_MESSAGE }, { status: 502 });
    }

    // Notification non bloquante : la soumission reste valide même si l'e-mail échoue.
    await notifyComite({
      titre: titreArticle,
      nom,
      prenom,
      email,
      profil,
      theme,
      edition,
      resume,
      fichierUrl,
      usage,
    });

    return Response.json({ submitted: true, usage });
  } catch (error) {
    log("exception lors de la soumission", error);
    return Response.json({ error: GENERIC_ERROR_MESSAGE }, { status: 500 });
  }
}
