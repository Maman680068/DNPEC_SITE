import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/code-des-marches-publics");
export const revalidate = 300;

export default async function Page() {
  const t = await getMessages();
  return (
    <InstitutionalPage
      slug="code-des-marches-publics"
      fallbackTitle={t.nav["/code-des-marches-publics"]}
      eyebrow="Textes réglementaires"
    />
  );
}
