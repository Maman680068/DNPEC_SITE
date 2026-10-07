import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminError from "@/components/admin/AdminError";
import StatusBadge from "@/components/admin/StatusBadge";
import PartenaireForm from "@/components/admin/forms/PartenaireForm";
import { getPartenaire } from "@/lib/admin/data";
import { readAdminResult } from "@/lib/admin/page-data";
import { getAdminSession } from "@/lib/admin/session";
import { canPublishDirectly } from "@/lib/admin/constants";

type PageProps = { params: Promise<{ id: string }> };

export default async function ModifierPartenairePage({ params }: PageProps) {
  const { id } = await params;
  const [result, session] = await Promise.all([getPartenaire(id), getAdminSession()]);
  const { data: item, error } = readAdminResult(result);
  if (!error && !item) notFound();
  const canPublish = session ? canPublishDirectly(session.roles) : false;

  if (error || !item) {
    return (
      <div>
        <AdminPageHeader title="Modifier le partenaire" />
        <AdminError message={error ?? "Élément introuvable."} />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Modifier le partenaire"
        subtitle={item.name}
        action={<StatusBadge status={item.status} rejected={item.rejected} />}
      />
      {item.rejected && (
        <p className="mb-4 text-[13.5px] text-navy bg-yellow/20 rounded-md px-4 py-3 max-w-2xl">
          Ce contenu a été rejeté. Corrigez-le puis enregistrez : il repartira en relecture.
        </p>
      )}
      <PartenaireForm mode="edit" id={id} canPublishDirectly={canPublish} initialData={item} />
    </div>
  );
}
