import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Textes réglementaires" };

export default function TextesReglementairesPage() {
  return <InstitutionalPage slug="textes-reglementaires" fallbackTitle="Textes réglementaires" />;
}
