import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="wrap">
      <PageTitle eyebrow="Contact" title="Contactez la DNPEC" />
      <section className="pb-14 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10">
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-lg border border-line p-6 text-[14.5px] leading-loose text-muted">
            <h2 className="text-navy text-base font-bold mb-3 font-heading">Coordonnées</h2>
            Direction Nationale des Prévisions Économiques et de la Conjoncture
            <br />
            Kaloum, Conakry — République de Guinée
            <br />
            infos@dnpec.gov.gn
            <br />
            +224 662 46 45 67
          </div>
          <div className="rounded-lg border-2 border-dashed border-line bg-white h-[220px] flex items-center justify-center text-sm text-muted text-center p-4">
            Carte de localisation à intégrer (Kaloum, Conakry)
          </div>
        </div>
        <ContactForm />
      </section>

      <section id="directeur-national" className="pb-14 max-w-3xl scroll-mt-24">
        <h2 className="text-2xl text-navy relative pb-2.5 mb-5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-11 after:h-[3px] after:bg-yellow">
          Écrire au Directeur National
        </h2>
        <div className="bg-white rounded-lg border border-line p-6 text-[14.5px] leading-relaxed text-muted">
          <p className="mb-4">
            Pour une correspondance adressée directement au Directeur National de la DNPEC,
            écrivez à l&apos;adresse ci-dessous en précisant l&apos;objet de votre demande.
          </p>
          <a
            href="mailto:infos@dnpec.gov.gn?subject=%C3%80%20l%27attention%20du%20Directeur%20National"
            className="inline-block bg-red text-white font-bold text-sm px-6 h-11 rounded-lg leading-[44px]"
          >
            Écrire au Directeur National
          </a>
        </div>
      </section>
    </div>
  );
}
