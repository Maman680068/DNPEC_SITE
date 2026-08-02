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
          subtitle="Soumettez votre article scientifique pour examen par le comité éditorial de la RPAE. Chaque soumission est reçue en brouillon et fait l'objet d'une validation manuelle avant toute publication."
        />
        <section className="pb-14">
          <RpaeSubmissionForm />
        </section>
      </div>
    </div>
  );
}
