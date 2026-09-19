import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/tbfp");
export const revalidate = 300;

export default async function TbfpPage() {
  const t = await getMessages();
  return (
    <InstitutionalPage
      slug="tbfp"
      fallbackTitle={t.nav["/tbfp"]}
      eyebrow="Documents budgétaires"
      yearlyGrid
    />
  );
}
