import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PublicationForm from "@/components/admin/forms/PublicationForm";
import { getAdminSession } from "@/lib/admin/session";
import { canPublishDirectly } from "@/lib/admin/constants";

export default async function NouvellePublicationPage() {
  const session = await getAdminSession();
  const canPublish = session ? canPublishDirectly(session.roles) : false;

  return (
    <div>
      <AdminPageHeader title="Nouvelle publication" subtitle="Document ou rapport du site." />
      <PublicationForm mode="create" canPublishDirectly={canPublish} />
    </div>
  );
}
