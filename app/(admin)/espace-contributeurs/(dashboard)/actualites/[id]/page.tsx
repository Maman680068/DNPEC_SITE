import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminError from "@/components/admin/AdminError";
import StatusBadge from "@/components/admin/StatusBadge";
import ActualiteForm from "@/components/admin/forms/ActualiteForm";
import { getActualite, HIDDEN_CATEGORY_SLUGS, listCategories } from "@/lib/admin/data";
import { readAdminResult } from "@/lib/admin/page-data";
import { getAdminSession } from "@/lib/admin/session";
import { isNumericId, canPublishDirectly } from "@/lib/admin/constants";

type PageProps = { params: Promise<{ id: string }> };

export default async function ModifierActualitePage({ params }: PageProps) {
  const { id } = await params;
  if (!isNumericId(id)) notFound();
  const [itemResult, categoriesResult, session] = await Promise.all([
    getActualite(id),
    listCategories(),
    getAdminSession(),
  ]);
  const item = readAdminResult(itemResult);
  const categories = readAdminResult(categoriesResult);
  if (!item.error && !item.data) notFound();

  const canPublish = session ? canPublishDirectly(session.roles) : false;
  const error = item.error ?? categories.error;
  if (error || !item.data || !categories.data) {
    return (
      <div>
        <AdminPageHeader title="Modifier l'article" />
        <AdminError message={error ?? "Article introuvable."} />
      </div>
    );
  }

  const selectable = categories.data.filter((c) => !HIDDEN_CATEGORY_SLUGS.has(c.slug));
  const currentCategoryId = item.data.categoryIds.find((id) => selectable.some((c) => c.id === id)) ?? null;

  return (
    <div>
      <AdminPageHeader
        title="Modifier l'article"
        subtitle={item.data.title}
        action={<StatusBadge status={item.data.status} rejected={item.data.rejected} />}
      />
      {item.data.rejected && (
        <p className="mb-4 text-[13.5px] text-navy bg-yellow/20 rounded-md px-4 py-3 max-w-2xl">
          Cet article a été rejeté. Corrigez-le puis enregistrez : il repartira en relecture.
        </p>
      )}
      <ActualiteForm
        mode="edit"
        id={id}
        canPublishDirectly={canPublish}
        categories={selectable}
        initialData={{
          title: item.data.title,
          excerpt: item.data.excerpt,
          content: item.data.content,
          categoryId: currentCategoryId,
          coverImage: item.data.coverImage,
        }}
      />
    </div>
  );
}
