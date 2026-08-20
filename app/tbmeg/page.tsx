import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/tbmeg");
export const revalidate = 300;

export default async function TbmegPage() {
  const t = await getMessages();
  return (
    <InstitutionalPage
      slug="tableau-de-bord-mensuel-de-leconomie-guineenne-tbmeg"
      fallbackTitle={t.nav["/tbmeg"]}
      eyebrow="Publications"
      yearlyGrid
    />
  );
}
