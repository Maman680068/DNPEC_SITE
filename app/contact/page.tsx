import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="wrap">
      <div className="contact-hero relative rounded-[10px] overflow-hidden p-4 md:p-5 mb-11">
        <div className="flag-strip absolute top-0 left-0 right-0" />
        <div className="text-xs font-semibold text-yellow uppercase tracking-wide mb-2">Contact</div>
        <h1 className="text-white text-[32px] font-heading font-semibold">Contactez-nous</h1>
        <p className="text-[#c3cee0] text-sm mt-2 max-w-xl">
          Une question, une suggestion ou besoin d&apos;informations complémentaires ? La DNPEC vous répond.
        </p>
      </div>

      <section className="pb-14 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10">
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-lg border border-line p-6 text-[14.5px] leading-loose text-muted">
            <h2 className="text-navy text-base font-bold mb-3 font-heading">Nos coordonnées</h2>
            <div className="flex flex-col gap-2">
              <div>
                <span className="text-navy font-semibold">Téléphone :</span> +224 662 46 45 67
              </div>
              <div>
                <span className="text-navy font-semibold">Email :</span> infos@dnpec.gov.gn
              </div>
              <div>
                <span className="text-navy font-semibold">Adresse :</span> Kaloum, Conakry – République de Guinée
              </div>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden border border-line h-[220px]">
            <iframe
              src="https://maps.google.com/maps?q=Kaloum,+Conakry,+Guin%C3%A9e&z=14&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localisation de la DNPEC — Kaloum, Conakry"
            />
          </div>
        </div>

        <ContactForm heading="Avez-vous des préoccupations ?" submitLabel="Envoyer" />
      </section>
    </div>
  );
}
