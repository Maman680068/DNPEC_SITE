import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Mission" };

export default function MissionPage() {
  return <InstitutionalPage slug="mission" fallbackTitle="Mission" />;
}
