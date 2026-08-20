import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/perspectives-economiques-financieres");
export const revalidate = 300;

export default async function PerspectivesEconomiquesFinancieresPage() {
  const t = await getMessages();
  return (
    <InstitutionalPage
      slug="perspectives-economiques-financieres"
      fallbackTitle={t.nav["/perspectives-economiques-financieres"]}
      eyebrow="Publications"
      yearlyGrid
    />
  );
}
