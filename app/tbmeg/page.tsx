import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "TBMEG" };
export const revalidate = 300;

export default function TbmegPage() {
  return (
    <InstitutionalPage
      slug="tableau-de-bord-mensuel-de-leconomie-guineenne-tbmeg"
      fallbackTitle="Tableau de Bord Mensuel de l'Économie Guinéenne (TBMEG)"
      eyebrow="Publications"
    />
  );
}
