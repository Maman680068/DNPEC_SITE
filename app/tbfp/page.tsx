import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "TBFP (Tableau de Bord Finances Publique)" };
export const revalidate = 300;

export default function Page() {
  return (
    <InstitutionalPage
      slug="tbfp"
      fallbackTitle="TBFP (Tableau de Bord Finances Publique)"
      eyebrow="Documents budgétaires"
    />
  );
}
