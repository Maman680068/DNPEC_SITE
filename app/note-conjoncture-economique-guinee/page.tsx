import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Note de conjoncture économique de la Guinée" };
export const revalidate = 300;

export default function Page() {
  return (
    <InstitutionalPage
      slug="note-conjoncture-economique-guinee"
      fallbackTitle="Note de conjoncture économique de la Guinée"
      eyebrow="Documents conjoncturels"
    />
  );
}
