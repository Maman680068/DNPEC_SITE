import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Documents de suivi de l'intégration économique régionale" };
export const revalidate = 300;

export default function Page() {
  return (
    <InstitutionalPage
      slug="documents-integration-regionale"
      fallbackTitle="Documents de suivi de l'intégration économique régionale"
      eyebrow="Publications"
    />
  );
}
