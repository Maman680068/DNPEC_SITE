import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegalesPage() {
  return (
    <div className="wrap">
      <PageTitle eyebrow="Informations légales" title="Mentions légales & politique de confidentialité" />
      <section className="pb-14 max-w-3xl flex flex-col gap-6 text-[14.5px] text-muted leading-relaxed">
        <div>
          <h2 className="text-navy text-lg font-bold mb-2 font-heading">Éditeur du site</h2>
          <p>
            Direction Nationale des Prévisions Économiques et de la Conjoncture (DNPEC), Ministère
            de l&apos;Économie, des Finances et du Budget — Kaloum, Conakry, République de Guinée.
          </p>
        </div>
        <div>
          <h2 className="text-navy text-lg font-bold mb-2 font-heading">Protection des données personnelles</h2>
          <p>
            Les données collectées via le formulaire de contact et l&apos;inscription à la
            newsletter sont utilisées uniquement dans le cadre du traitement de votre demande ou de
            l&apos;envoi de nos publications, avec votre consentement explicite. Vous disposez d&apos;un
            droit de désinscription à tout moment.
          </p>
        </div>
      </section>
    </div>
  );
}
