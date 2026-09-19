import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ActualiteForm from "@/components/admin/forms/ActualiteForm";
import { getActualite } from "@/lib/admin/data";
import { getAdminSession } from "@/lib/admin/session";
import { canPublishDirectly } from "@/lib/admin/constants";

type PageProps = { params: Promise<{ id: string }> };

export default async function ModifierActualitePage({ params }: PageProps) {
  const { id } = await params;
  const [item, session] = await Promise.all([getActualite(id), getAdminSession()]);
  if (!item) notFound();

  const canPublish = session ? canPublishDirectly(session.roles) : false;

  return (
    <div>
      <AdminPageHeader title="Modifier l'article" subtitle={item.title} />
      <ActualiteForm mode="edit" id={id} canPublishDirectly={canPublish} initialData={item} />
    </div>
  );
}
