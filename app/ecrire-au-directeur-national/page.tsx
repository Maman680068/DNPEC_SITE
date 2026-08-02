import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import DirecteurNationalCard from "@/components/contact/DirecteurNationalCard";

export const metadata: Metadata = { title: "Écrire au Directeur National" };

const DIRECTEUR_PHOTO = "https://solveexample.s2-tastewp.com/wp-content/uploads/2026/08/directeur-national-dnpec.jpg";
const DIRECTEUR_NAME = "Abdoulaye Ibrahima Diallo";
const DIRECTEUR_TITLE = "Directeur National (DNPEC)";

export default function EcrireAuDirecteurNationalPage() {
  return (
    <div className="wrap">
      <div className="contact-hero relative rounded-[10px] overflow-hidden p-4 md:p-5 mb-11">
        <div className="flag-strip absolute top-0 left-0 right-0" />
        <div className="text-xs font-semibold text-yellow uppercase tracking-wide mb-2">Contact</div>
        <h1 className="text-white text-[32px] font-heading font-semibold">Écrire au Directeur National</h1>
        <p className="text-[#c3cee0] text-sm mt-2 max-w-xl">
          Adressez votre message directement au Directeur National de la DNPEC.
        </p>
      </div>

      <section className="pb-14 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10">
        <ContactForm context="directeur-national" submitLabel="Envoyer" />
        <DirecteurNationalCard photo={DIRECTEUR_PHOTO} name={DIRECTEUR_NAME} title={DIRECTEUR_TITLE} />
      </section>
    </div>
  );
}
