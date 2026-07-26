import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Note hebdomadaire de l'économie guinéenne" };
export const revalidate = 300;

export default function Page() {
  return (
    <InstitutionalPage
      slug="note-hebdomadaire-economie-guineenne"
      fallbackTitle="Note hebdomadaire de l'économie guinéenne"
      eyebrow="Documents conjoncturels"
    />
  );
}
