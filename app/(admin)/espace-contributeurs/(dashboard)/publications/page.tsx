import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ComingSoon from "@/components/admin/ComingSoon";

export default function PublicationsAdminPage() {
  return (
    <div>
      <AdminPageHeader title="Publications" subtitle="Documents et rapports du site." />
      <ComingSoon label="Liste des publications et formulaire de création" />
    </div>
  );
}
