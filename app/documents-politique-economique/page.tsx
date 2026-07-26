import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Documents de politique économique" };
export const revalidate = 300;

export default function Page() {
  return (
    <InstitutionalPage
      slug="documents-politique-economique"
      fallbackTitle="Documents de politique économique"
      eyebrow="Publications"
    />
  );
}
