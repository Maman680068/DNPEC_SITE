import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/tofe");
export const revalidate = 300;

export default async function TofePage() {
  const t = await getMessages();
  return (
    <InstitutionalPage
      slug="tofe"
      fallbackTitle={t.nav["/tofe"]}
      eyebrow="Documents budgétaires"
      yearlyGrid
    />
  );
}
