import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Code des marchés publics" };
export const revalidate = 300;

export default function CodeDesMarchesPublicsPage() {
  return (
    <InstitutionalPage
      slug="code-des-marches-publics"
      fallbackTitle="Code des marchés publics"
      eyebrow="Textes réglementaires"
    />
  );
}
