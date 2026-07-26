import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "TOFE (Tableau des Opérations Financières de l'État)" };
export const revalidate = 300;

export default function Page() {
  return (
    <InstitutionalPage
      slug="tofe"
      fallbackTitle="TOFE (Tableau des Opérations Financières de l'État)"
      eyebrow="Documents budgétaires"
    />
  );
}
