import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Rapport CPIA" };
export const revalidate = 300;

export default function Page() {
  return (
    <InstitutionalPage
      slug="rapport-cpia-comite-devaluation-des-politiques-et-institutions-nationales"
      fallbackTitle="Rapport CPIA"
      eyebrow="Documents d'analyse et d'études économiques"
    />
  );
}
