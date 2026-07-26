import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Documents de travail" };
export const revalidate = 300;

export default function Page() {
  return (
    <InstitutionalPage
      slug="documents-travail"
      fallbackTitle="Documents de travail"
      eyebrow="Publications"
    />
  );
}
