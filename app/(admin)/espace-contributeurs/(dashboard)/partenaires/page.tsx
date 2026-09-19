import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ComingSoon from "@/components/admin/ComingSoon";

export default function PartenairesAdminPage() {
  return (
    <div>
      <AdminPageHeader title="Partenaires" subtitle="Logos et liens partenaires affichés sur l'accueil." />
      <ComingSoon label="Liste des partenaires et formulaire de création" />
    </div>
  );
}
