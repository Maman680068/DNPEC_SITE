import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Code des investissements" };
export const revalidate = 300;

export default function CodeDesInvestissementsPage() {
  return (
    <InstitutionalPage
      slug="code-des-investissements"
      fallbackTitle="Code des investissements"
      eyebrow="Textes réglementaires"
    />
  );
}
