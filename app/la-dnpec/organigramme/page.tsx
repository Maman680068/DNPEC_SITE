import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Organigramme" };

export default function OrganigrammePage() {
  return <InstitutionalPage slug="organigramme" fallbackTitle="Organigramme" />;
}
