import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PartenaireForm from "@/components/admin/forms/PartenaireForm";
import { getAdminSession } from "@/lib/admin/session";
import { canPublishDirectly } from "@/lib/admin/constants";

export default async function NouveauPartenairePage() {
  const session = await getAdminSession();
  const canPublish = session ? canPublishDirectly(session.roles) : false;

  return (
    <div>
      <AdminPageHeader title="Nouveau partenaire" subtitle="Logo et lien affichés sur l'accueil." />
      <PartenaireForm mode="create" canPublishDirectly={canPublish} />
    </div>
  );
}
