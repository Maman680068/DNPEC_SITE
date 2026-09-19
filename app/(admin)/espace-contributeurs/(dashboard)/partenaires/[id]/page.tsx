import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PartenaireForm from "@/components/admin/forms/PartenaireForm";
import { getPartenaire } from "@/lib/admin/data";
import { getAdminSession } from "@/lib/admin/session";
import { canPublishDirectly } from "@/lib/admin/constants";

type PageProps = { params: Promise<{ id: string }> };

export default async function ModifierPartenairePage({ params }: PageProps) {
  const { id } = await params;
  const [item, session] = await Promise.all([getPartenaire(id), getAdminSession()]);
  if (!item) notFound();

  const canPublish = session ? canPublishDirectly(session.roles) : false;

  return (
    <div>
      <AdminPageHeader title="Modifier le partenaire" subtitle={item.name} />
      <PartenaireForm mode="edit" id={id} canPublishDirectly={canPublish} initialData={item} />
    </div>
  );
}
