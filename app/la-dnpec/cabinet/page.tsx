import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Cabinet" };
export const revalidate = 300;

export default function CabinetPage() {
  return <InstitutionalPage slug="cabinet" fallbackTitle="Cabinet" />;
}
