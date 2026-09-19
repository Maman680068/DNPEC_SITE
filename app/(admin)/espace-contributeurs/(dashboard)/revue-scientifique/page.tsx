import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ComingSoon from "@/components/admin/ComingSoon";

export default function RevueScientifiqueAdminPage() {
  return (
    <div>
      <AdminPageHeader
        title="Revue scientifique (RPAE)"
        subtitle="Articles soumis : en attente de relecture, publiés, rejetés."
      />
      <ComingSoon label="Tableau de bord de validation des articles RPAE" />
    </div>
  );
}
