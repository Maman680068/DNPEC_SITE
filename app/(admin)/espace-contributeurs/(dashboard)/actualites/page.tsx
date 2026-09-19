import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ComingSoon from "@/components/admin/ComingSoon";

export default function ActualitesAdminPage() {
  return (
    <div>
      <AdminPageHeader title="Actualités" subtitle="Créer ou modifier un article du site." />
      <ComingSoon label="Liste des articles et formulaire de création" />
    </div>
  );
}
