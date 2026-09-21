import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/transition-fiscale");
export const revalidate = 300;

export default async function Page() {
  const t = await getMessages();
  return (
    <InstitutionalPage
      slug="transition-fiscale"
      fallbackTitle={t.nav["/transition-fiscale"]}
      eyebrow="Publications"
    />
  );
}
