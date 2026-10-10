import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/rapport-economique-financier");
export const revalidate = 300;

export default async function Page() {
  const t = await getMessages();
  return (
    <InstitutionalPage
      slug="rapport-economique-et-financier-ref"
      fallbackTitle={t.nav["/rapport-economique-financier"]}
      eyebrow="Documents d'analyse et d'études économiques"
    />
  );
}
