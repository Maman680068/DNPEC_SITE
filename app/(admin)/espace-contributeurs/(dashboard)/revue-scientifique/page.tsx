import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminError from "@/components/admin/AdminError";
import RpaeDashboard from "@/components/admin/rpae/RpaeDashboard";
import { listRpaeSubmissions } from "@/lib/admin/rpae";
import { readAdminResult } from "@/lib/admin/page-data";

export default async function RevueScientifiqueAdminPage() {
  const { data, error } = readAdminResult(await listRpaeSubmissions());

  return (
    <div>
      <AdminPageHeader
        title="Revue scientifique (RPAE)"
        subtitle="Articles soumis : en attente de relecture, publiés, rejetés."
      />
      {error ? <AdminError message={error} /> : <RpaeDashboard items={data ?? []} />}
    </div>
  );
}
