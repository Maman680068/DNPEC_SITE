import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PublicationForm from "@/components/admin/forms/PublicationForm";
import { getPublication } from "@/lib/admin/data";
import { getAdminSession } from "@/lib/admin/session";
import { canPublishDirectly } from "@/lib/admin/constants";

type PageProps = { params: Promise<{ id: string }> };

export default async function ModifierPublicationPage({ params }: PageProps) {
  const { id } = await params;
  const [item, session] = await Promise.all([getPublication(id), getAdminSession()]);
  if (!item) notFound();

  const canPublish = session ? canPublishDirectly(session.roles) : false;

  return (
    <div>
      <AdminPageHeader title="Modifier la publication" subtitle={item.title} />
      <PublicationForm mode="edit" id={id} canPublishDirectly={canPublish} initialData={item} />
    </div>
  );
}
