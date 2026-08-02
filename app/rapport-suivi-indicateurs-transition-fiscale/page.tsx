import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = {
  title: "Rapport de suivi des indicateurs de transition fiscale",
};
export const revalidate = 300;

export default function RapportSuiviIndicateursTransitionFiscalePage() {
  return (
    <InstitutionalPage
      slug="rapport-suivi-indicateurs-transition-fiscale"
      fallbackTitle="Rapport de suivi des indicateurs de transition fiscale"
      eyebrow="Publications"
      yearlyGrid
    />
  );
}
