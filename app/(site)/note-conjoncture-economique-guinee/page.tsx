import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/note-conjoncture-economique-guinee");
export const revalidate = 300;

export default async function Page() {
  const t = await getMessages();
  return (
    <InstitutionalPage
      slug="note-conjoncture-economique-guinee"
      fallbackTitle={t.nav["/note-conjoncture-economique-guinee"]}
      eyebrow="Documents conjoncturels"
    />
  );
}
