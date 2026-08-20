import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/la-dnpec/mot-du-directeur");
export const revalidate = 300;

export default async function MotDuDirecteurPage() {
  const t = await getMessages();
  return (
    <InstitutionalPage
      slug="mot-du-directeur-national"
      fallbackTitle={t.nav["/la-dnpec/mot-du-directeur"]}
      photoCaption={{ name: "Abdoulaye Ibrahima Diallo", role: t.directorTitle }}
    />
  );
}
