import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ActualiteForm from "@/components/admin/forms/ActualiteForm";
import { getAdminSession } from "@/lib/admin/session";
import { canPublishDirectly } from "@/lib/admin/constants";

export default async function NouvelleActualitePage() {
  const session = await getAdminSession();
  const canPublish = session ? canPublishDirectly(session.roles) : false;

  return (
    <div>
      <AdminPageHeader title="Nouvel article" subtitle="Actualités du site." />
      <ActualiteForm mode="create" canPublishDirectly={canPublish} />
    </div>
  );
}
