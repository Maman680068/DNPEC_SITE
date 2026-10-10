import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/autres-etudes-economiques");
export const revalidate = 300;

export default async function Page() {
  const t = await getMessages();
  return (
    <InstitutionalPage
      slug="autres-etudes-economiques"
      fallbackTitle={t.nav["/autres-etudes-economiques"]}
      eyebrow="Documents d'analyse et d'études économiques"
    />
  );
}
