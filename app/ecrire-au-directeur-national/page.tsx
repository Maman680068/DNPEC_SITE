import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import ContactForm from "@/components/contact/ContactForm";
import DirecteurNationalCard from "@/components/contact/DirecteurNationalCard";

export const metadata: Metadata = { title: "Écrire au Directeur National" };

const DIRECTEUR_PHOTO = "https://solveexample.s2-tastewp.com/wp-content/uploads/2026/08/directeur-national-dnpec.jpg";
const DIRECTEUR_NAME = "Abdoulaye Ibrahima Diallo";
const DIRECTEUR_TITLE = "Directeur National (DNPEC)";

export default function EcrireAuDirecteurNationalPage() {
  return (
    <div className="wrap">
      <PageTitle
        eyebrow="Contact"
        title="Écrire au Directeur National"
        subtitle="Adressez votre message directement au Directeur National de la DNPEC."
      />

      <section className="pb-14 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10">
        <ContactForm context="directeur-national" submitLabel="Envoyer" />
        <DirecteurNationalCard photo={DIRECTEUR_PHOTO} name={DIRECTEUR_NAME} title={DIRECTEUR_TITLE} />
      </section>
    </div>
  );
}
