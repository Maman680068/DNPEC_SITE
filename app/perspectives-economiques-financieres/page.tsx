import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = {
  title: "PEF — Perspectives économiques et financières",
};
export const revalidate = 300;

export default function PerspectivesEconomiquesFinancieresPage() {
  return (
    <InstitutionalPage
      slug="perspectives-economiques-financieres"
      fallbackTitle="PEF — Perspectives économiques et financières"
      eyebrow="Publications"
      yearlyGrid
    />
  );
}
