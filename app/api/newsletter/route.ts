import type { NextRequest } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

// TODO: remplacer par l'adresse définitive une fois le domaine vérifié sur Resend.
// Compte Resend non vérifié : ne peut envoyer qu'à l'adresse du titulaire du
// compte tant qu'aucun domaine d'envoi n'est vérifié.
const RECIPIENT = "soumah6868@gmail.com";
// Même adresse d'envoi que le formulaire de contact (app/api/contact/route.ts).
const FROM_ADDRESS = process.env.CONTACT_FROM_EMAIL || "DNPEC — Site web <onboarding@resend.dev>";

const GENERIC_ERROR_MESSAGE =
  "Une erreur est survenue, merci de réessayer plus tard ou de nous contacter directement par téléphone.";

// Validation basique de format — pas de vérification d'existence du domaine/boîte,
// juste s'assurer que la valeur ressemble à une adresse e-mail.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type NewsletterPayload = {
  email?: string;
};

function log(reason: string, detail?: unknown) {
  console.warn(`[newsletter] ${reason}${detail ? ` — ${String(detail)}` : ""}`);
}

export async function POST(request: NextRequest) {
  let body: NewsletterPayload;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const email = body.email?.trim();
  if (!email || !EMAIL_REGEX.test(email)) {
    return Response.json({ error: "Merci de saisir une adresse e-mail valide." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    log("RESEND_API_KEY absente, envoi impossible");
    return Response.json({ error: GENERIC_ERROR_MESSAGE }, { status: 503 });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: RECIPIENT,
      subject: "Nouvelle inscription à la newsletter DNPEC",
      text: `Nouvelle inscription à la newsletter.\n\nAdresse e-mail : ${email}`,
    });

    if (error) {
      log("échec de l'envoi Resend", error.message);
      return Response.json({ error: GENERIC_ERROR_MESSAGE }, { status: 502 });
    }

    return Response.json({ subscribed: true });
  } catch (error) {
    log("exception lors de l'envoi", error);
    return Response.json({ error: GENERIC_ERROR_MESSAGE }, { status: 500 });
  }
}
