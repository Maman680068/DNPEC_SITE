import type { NextRequest } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const RECIPIENT = "infos@dnpec.gov.gn";
// Adresse d'envoi Resend — le domaine sandbox par défaut fonctionne sans
// vérification de domaine ; à surcharger avec CONTACT_FROM_EMAIL une fois un
// domaine DNPEC vérifié sur Resend.
const FROM_ADDRESS = process.env.CONTACT_FROM_EMAIL || "DNPEC — Site web <onboarding@resend.dev>";

const GENERIC_ERROR_MESSAGE =
  "Une erreur est survenue, merci de réessayer plus tard ou de nous contacter directement par téléphone.";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  context?: "contact" | "directeur-national";
};

function log(reason: string, detail?: unknown) {
  console.warn(`[contact] ${reason}${detail ? ` — ${String(detail)}` : ""}`);
}

export async function POST(request: NextRequest) {
  let body: ContactPayload;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const { name, email, phone, subject, message, context } = body;

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return Response.json({ error: "Merci de remplir tous les champs obligatoires." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    log("RESEND_API_KEY absente, envoi impossible");
    return Response.json({ error: GENERIC_ERROR_MESSAGE }, { status: 503 });
  }

  const isDirecteurNational = context === "directeur-national";
  const emailSubject = isDirecteurNational
    ? `Message adressé au Directeur National — ${subject}`
    : `[Formulaire de contact] ${subject}`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: RECIPIENT,
      replyTo: email,
      subject: emailSubject,
      text: [
        `Nom & Prénom : ${name}`,
        `Email : ${email}`,
        `Téléphone : ${phone?.trim() || "Non renseigné"}`,
        `Sujet : ${subject}`,
        "",
        message,
      ].join("\n"),
    });

    if (error) {
      log("échec de l'envoi Resend", error.message);
      return Response.json({ error: GENERIC_ERROR_MESSAGE }, { status: 502 });
    }

    return Response.json({ sent: true });
  } catch (error) {
    log("exception lors de l'envoi", error);
    return Response.json({ error: GENERIC_ERROR_MESSAGE }, { status: 500 });
  }
}
