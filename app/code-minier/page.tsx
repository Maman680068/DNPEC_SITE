import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Code minier" };
export const revalidate = 300;

export default function CodeMinierPage() {
  return (
    <InstitutionalPage
      slug="code-minier"
      fallbackTitle="Code minier"
      eyebrow="Textes réglementaires"
    />
  );
}
