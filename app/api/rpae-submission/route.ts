import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const GENERIC_ERROR_MESSAGE =
  "Une erreur est survenue, merci de réessayer plus tard ou de nous contacter directement par téléphone.";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 Mo
const ALLOWED_EXTENSIONS = [".docx", ".xlsx"];

// .docx/.xlsx sont des fichiers ZIP — vérifie les octets réels plutôt que de
// faire confiance à l'extension ou au Content-Type envoyés par le
// navigateur, facilement falsifiables.
const ZIP_MAGIC_BYTES = [0x50, 0x4b, 0x03, 0x04];

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

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  // Honeypot anti-spam : champ caché que seul un bot remplit (voir
  // components/revue/RpaeSubmissionForm.tsx). Rejet silencieux — on répond
  // succès sans rien créer côté WordPress, pour ne pas révéler la détection.
  const honeypot = formData.get("site_web");
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    log("honeypot rempli, rejet silencieux");
    return Response.json({ submitted: true });
  }

  const nom = formData.get("nom");
  const prenom = formData.get("prenom");
  const email = formData.get("email");
  const telephone = formData.get("telephone");
  const nationalite = formData.get("nationalite");
  const grade = formData.get("grade");
  const fonction = formData.get("fonction");
  const edition = formData.get("edition");
  const titreArticle = formData.get("titreArticle");
  const file = formData.get("file");

  const requiredFields = { nom, prenom, email, nationalite, grade, fonction, edition, titreArticle };
  for (const value of Object.values(requiredFields)) {
    if (typeof value !== "string" || !value.trim()) {
      return Response.json({ error: "Merci de remplir tous les champs obligatoires." }, { status: 400 });
    }
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

    const postContent = [
      `<!-- rpae:nom-auteur ${nom} -->`,
      `<!-- rpae:prenom-auteur ${prenom} -->`,
      `<!-- rpae:email-auteur ${email} -->`,
      `<!-- rpae:telephone-auteur ${typeof telephone === "string" ? telephone : ""} -->`,
      `<!-- rpae:nationalite-auteur ${nationalite} -->`,
      `<!-- rpae:grade-auteur ${grade} -->`,
      `<!-- rpae:fonction-auteur ${fonction} -->`,
      `<!-- rpae:edition-annee ${edition} -->`,
      `<!-- rpae:titre-article ${titreArticle} -->`,
      `<!-- rpae:fichier-url ${media.source_url ?? ""} -->`,
      `<!-- rpae:fichier-nom ${file.name} -->`,
    ].join("\n");

    const postRes = await fetch(`${wpApiUrl}/posts`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: titreArticle,
        content: postContent,
        status: "draft",
      }),
    });

    if (!postRes.ok) {
      log("échec de la création du brouillon WordPress", `HTTP ${postRes.status}`);
      return Response.json({ error: GENERIC_ERROR_MESSAGE }, { status: 502 });
    }

    return Response.json({ submitted: true });
  } catch (error) {
    log("exception lors de la soumission", error);
    return Response.json({ error: GENERIC_ERROR_MESSAGE }, { status: 500 });
  }
}
