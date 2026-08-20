import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/note-hebdomadaire-economie-guineenne");
export const revalidate = 300;

export default async function Page() {
  const t = await getMessages();
  return (
    <InstitutionalPage
      slug="note-hebdomadaire-economie-guineenne"
      fallbackTitle={t.nav["/note-hebdomadaire-economie-guineenne"]}
      eyebrow="Documents conjoncturels"
    />
  );
}
