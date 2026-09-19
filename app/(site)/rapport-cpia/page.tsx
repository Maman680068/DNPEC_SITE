import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/rapport-cpia");
export const revalidate = 300;

export default async function Page() {
  const t = await getMessages();
  return (
    <InstitutionalPage
      slug="rapport-cpia-comite-devaluation-des-politiques-et-institutions-nationales"
      fallbackTitle={t.nav["/rapport-cpia"]}
      eyebrow="Documents d'analyse et d'études économiques"
    />
  );
}
