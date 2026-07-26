import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Rapports" };
export const revalidate = 300;

export default function Page() {
  return (
    <InstitutionalPage
      slug="rapports-analyses-etudes"
      fallbackTitle="Rapports"
      eyebrow="Documents d'analyse et d'études économiques"
    />
  );
}
