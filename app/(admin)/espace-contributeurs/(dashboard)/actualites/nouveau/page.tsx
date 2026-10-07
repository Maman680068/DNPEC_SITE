import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminError from "@/components/admin/AdminError";
import ActualiteForm from "@/components/admin/forms/ActualiteForm";
import { HIDDEN_CATEGORY_SLUGS, listCategories } from "@/lib/admin/data";
import { readAdminResult } from "@/lib/admin/page-data";
import { getAdminSession } from "@/lib/admin/session";
import { canPublishDirectly } from "@/lib/admin/constants";

export default async function NouvelleActualitePage() {
  const [session, categoriesResult] = await Promise.all([getAdminSession(), listCategories()]);
  const { data: categories, error } = readAdminResult(categoriesResult);
  const canPublish = session ? canPublishDirectly(session.roles) : false;

  return (
    <div>
      <AdminPageHeader title="Nouvel article" subtitle="Actualités du site." />
      {error ? (
        <AdminError message={error} />
      ) : (
        <ActualiteForm
          mode="create"
          canPublishDirectly={canPublish}
          categories={(categories ?? []).filter((c) => !HIDDEN_CATEGORY_SLUGS.has(c.slug))}
        />
      )}
    </div>
  );
}
