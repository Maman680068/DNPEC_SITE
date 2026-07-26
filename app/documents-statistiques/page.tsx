import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Documents statistiques" };
export const revalidate = 300;

export default function Page() {
  return (
    <InstitutionalPage
      slug="documents-statistiques"
      fallbackTitle="Documents statistiques"
      eyebrow="Publications"
    />
  );
}
