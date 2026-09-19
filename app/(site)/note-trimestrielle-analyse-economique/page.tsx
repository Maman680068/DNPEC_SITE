import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/note-trimestrielle-analyse-economique");
export const revalidate = 300;

export default async function Page() {
  const t = await getMessages();
  return (
    <InstitutionalPage
      slug="note-trimestrielle-analyse-economique"
      fallbackTitle={t.nav["/note-trimestrielle-analyse-economique"]}
      eyebrow="Documents d'analyse et d'études économiques"
    />
  );
}
