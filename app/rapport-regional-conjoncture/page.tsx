import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Rapport régional de conjoncture (RRC)" };
export const revalidate = 300;

export default function Page() {
  return (
    <InstitutionalPage
      slug="rapport-regional-conjoncture"
      fallbackTitle="Rapport régional de conjoncture (RRC)"
      eyebrow="Documents conjoncturels"
    />
  );
}
