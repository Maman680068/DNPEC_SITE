import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/rapports-analyses-etudes");
export const revalidate = 300;

export default async function Page() {
  const t = await getMessages();
  return (
    <InstitutionalPage
      slug="rapports-analyses-etudes"
      fallbackTitle={t.nav["/rapports-analyses-etudes"]}
      eyebrow="Documents d'analyse et d'études économiques"
    />
  );
}
