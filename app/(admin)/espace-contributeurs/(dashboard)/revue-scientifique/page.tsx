import AdminPageHeader from "@/components/admin/AdminPageHeader";
import RpaeDashboard from "@/components/admin/rpae/RpaeDashboard";
import { listRpaeSubmissions } from "@/lib/admin/rpae";

export default async function RevueScientifiqueAdminPage() {
  const items = await listRpaeSubmissions();

  return (
    <div>
      <AdminPageHeader
        title="Revue scientifique (RPAE)"
        subtitle="Articles soumis : en attente de relecture, publiés, rejetés."
      />
      <RpaeDashboard items={items} />
    </div>
  );
}
