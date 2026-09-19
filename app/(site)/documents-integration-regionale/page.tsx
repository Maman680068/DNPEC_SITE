import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/documents-integration-regionale");
export const revalidate = 300;

export default async function Page() {
  const t = await getMessages();
  return (
    <InstitutionalPage
      slug="documents-integration-regionale"
      fallbackTitle={t.nav["/documents-integration-regionale"]}
      eyebrow="Publications"
    />
  );
}
