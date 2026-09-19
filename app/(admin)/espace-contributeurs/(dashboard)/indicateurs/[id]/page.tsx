import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import IndicateurForm from "@/components/admin/forms/IndicateurForm";
import { getIndicateur } from "@/lib/admin/data";
import { getAdminSession } from "@/lib/admin/session";
import { canPublishDirectly } from "@/lib/admin/constants";

type PageProps = { params: Promise<{ id: string }> };

export default async function ModifierIndicateurPage({ params }: PageProps) {
  const { id } = await params;
  const [item, session] = await Promise.all([getIndicateur(id), getAdminSession()]);
  if (!item) notFound();

  const canPublish = session ? canPublishDirectly(session.roles) : false;

  return (
    <div>
      <AdminPageHeader title="Modifier l'indicateur" subtitle={item.label} />
      <IndicateurForm mode="edit" id={id} canPublishDirectly={canPublish} initialData={item} />
    </div>
  );
}
