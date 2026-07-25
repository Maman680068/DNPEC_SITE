import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Code général des impôts" };
export const revalidate = 300;

export default function CodeGeneralDesImpotsPage() {
  return (
    <InstitutionalPage
      slug="code-general-des-impots"
      fallbackTitle="Code général des impôts"
      eyebrow="Textes réglementaires"
    />
  );
}
