import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ComingSoon from "@/components/admin/ComingSoon";

export default function IndicateursAdminPage() {
  return (
    <div>
      <AdminPageHeader title="Indicateurs" subtitle="Chiffres clés affichés sur la page d'accueil." />
      <ComingSoon label="Liste des indicateurs et formulaire de création" />
    </div>
  );
}
