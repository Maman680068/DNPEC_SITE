import PageEnConstruction from "@/components/ui/PageEnConstruction";
import { getMessages } from "@/lib/i18n/locale";

export default async function DonneesPage() {
  const t = await getMessages();
  return <PageEnConstruction title={t.nav["/donnees"]} />;
}
