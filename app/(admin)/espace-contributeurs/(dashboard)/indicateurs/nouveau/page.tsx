import AdminPageHeader from "@/components/admin/AdminPageHeader";
import IndicateurForm from "@/components/admin/forms/IndicateurForm";
import { getAdminSession } from "@/lib/admin/session";
import { canPublishDirectly } from "@/lib/admin/constants";

export default async function NouvelIndicateurPage() {
  const session = await getAdminSession();
  const canPublish = session ? canPublishDirectly(session.roles) : false;

  return (
    <div>
      <AdminPageHeader title="Nouvel indicateur" subtitle="Chiffre clé affiché sur l'accueil." />
      <IndicateurForm mode="create" canPublishDirectly={canPublish} />
    </div>
  );
}
