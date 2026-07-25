import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Mot du Directeur National" };

export default function MotDuDirecteurPage() {
  return (
    <InstitutionalPage
      slug="mot-du-directeur-national"
      fallbackTitle="Mot du Directeur National"
      photoCaption={{ name: "Abdoulaye Ibrahima Diallo", role: "Directeur National" }}
    />
  );
}
