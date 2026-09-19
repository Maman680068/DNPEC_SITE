import PageEnConstruction from "@/components/ui/PageEnConstruction";
import { getMessages } from "@/lib/i18n/locale";

export default async function ConferencesSeminairesPage() {
  const t = await getMessages();
  return <PageEnConstruction title={t.nav["/conferences-seminaires"]} />;
}
