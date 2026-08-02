import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import RpaeSubmissionForm from "@/components/revue/RpaeSubmissionForm";

export const metadata: Metadata = { title: "Soumettre un article — Revue Scientifique" };

export default function SoumettreArticlePage() {
  return (
    <div className="wrap">
      <div className="max-w-3xl mx-auto">
        <PageTitle
          eyebrow="Revue Scientifique"
          title="Soumettre un article"
          subtitle="Soumettez votre article (Word ou Excel). Il sera placé en file d'attente WordPress pour le comité scientifique de la DNPEC (profil, thème et résumé servent au classement). Après analyse interne, seule une publication validée pourra apparaître dans la revue."
        />
        <section className="pb-14">
          <RpaeSubmissionForm />
        </section>
      </div>
    </div>
  );
}
