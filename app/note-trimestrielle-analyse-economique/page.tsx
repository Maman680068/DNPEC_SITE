import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Note trimestrielle d'analyse économique" };
export const revalidate = 300;

export default function Page() {
  return (
    <InstitutionalPage
      slug="note-trimestrielle-analyse-economique"
      fallbackTitle="Note trimestrielle d'analyse économique"
      eyebrow="Documents d'analyse et d'études économiques"
    />
  );
}
