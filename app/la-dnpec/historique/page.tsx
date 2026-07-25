import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Historique" };

export default function HistoriquePage() {
  return <InstitutionalPage slug="historique" fallbackTitle="Historique" />;
}
