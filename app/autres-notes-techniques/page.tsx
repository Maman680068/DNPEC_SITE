import type { Metadata } from "next";
import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";

export const metadata: Metadata = { title: "Autres notes techniques" };
export const revalidate = 300;

export default function Page() {
  return (
    <InstitutionalPage
      slug="autres-notes-techniques"
      fallbackTitle="Autres notes techniques"
      eyebrow="Documents conjoncturels"
    />
  );
}
