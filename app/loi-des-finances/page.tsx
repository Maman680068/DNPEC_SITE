import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Loi des finances" };
export const revalidate = 300;

export default function LoiDesFinancesPage() {
  return (
    <InstitutionalPage
      slug="loi-des-finances"
      fallbackTitle="Loi des finances"
      eyebrow="Textes réglementaires"
    />
  );
}
