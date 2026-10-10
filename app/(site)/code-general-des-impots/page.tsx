import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/code-general-des-impots");
export const revalidate = 300;

export default async function Page() {
  const t = await getMessages();
  return (
    <InstitutionalPage
      slug="code-general-des-impots"
      fallbackTitle={t.nav["/code-general-des-impots"]}
      eyebrow="Textes réglementaires"
    />
  );
}
