import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Transition fiscale" };
export const revalidate = 300;

export default function TransitionFiscalePage() {
  return (
    <InstitutionalPage
      slug="transition-fiscale"
      fallbackTitle="Transition fiscale"
      eyebrow="Publications"
      yearlyGrid
    />
  );
}
