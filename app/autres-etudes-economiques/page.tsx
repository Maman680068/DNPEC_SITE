import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Autres études" };
export const revalidate = 300;

export default function Page() {
  return (
    <InstitutionalPage
      slug="autres-etudes-economiques"
      fallbackTitle="Autres études"
      eyebrow="Documents d'analyse et d'études économiques"
    />
  );
}
