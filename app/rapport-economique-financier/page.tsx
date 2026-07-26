import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Rapport économique et financier (REF)" };
export const revalidate = 300;

export default function Page() {
  return (
    <InstitutionalPage
      slug="rapport-economique-financier"
      fallbackTitle="Rapport économique et financier (REF)"
      eyebrow="Documents d'analyse et d'études économiques"
    />
  );
}
