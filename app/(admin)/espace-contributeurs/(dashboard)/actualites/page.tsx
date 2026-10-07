import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminError from "@/components/admin/AdminError";
import StatusBadge from "@/components/admin/StatusBadge";
import ModerationActions from "@/components/admin/ModerationActions";
import { listActualites } from "@/lib/admin/data";
import { readAdminResult } from "@/lib/admin/page-data";
import { getAdminSession } from "@/lib/admin/session";
import { canModerate as rolesCanModerate } from "@/lib/admin/constants";

export default async function ActualitesAdminPage() {
  const [result, session] = await Promise.all([listActualites(), getAdminSession()]);
  const { data, error } = readAdminResult(result);
  const items = data ?? [];
  const canModerate = session ? rolesCanModerate(session.roles) : false;

  return (
    <div>
      <AdminPageHeader
        title="Actualités"
        subtitle="Créer ou modifier un article du site. Les articles de la revue scientifique sont gérés dans leur propre rubrique."
        action={
          <Link
            href="/espace-contributeurs/actualites/nouveau"
            className="inline-flex items-center justify-center bg-yellow text-navy-dark font-bold text-sm px-5 h-11 rounded-lg hover:brightness-95 transition-[filter]"
          >
            Nouvel article
          </Link>
        }
      />

      {error ? (
        <AdminError message={error} />
      ) : items.length === 0 ? (
        <p className="text-muted text-sm">Aucun article pour le moment.</p>
      ) : (
        <div className="bg-white rounded-lg border border-line divide-y divide-line">
          {items.map((item) => (
            <div key={item.id} className="p-4 flex flex-wrap items-center gap-3 justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/espace-contributeurs/actualites/${item.id}`}
                    className="text-navy font-semibold text-[15px] hover:underline"
                  >
                    {item.title || "(sans titre)"}
                  </Link>
                  <StatusBadge status={item.status} rejected={item.rejected} />
                </div>
                <p className="text-muted text-[13px] mt-1">
                  {item.categoryName ?? "Sans catégorie"}
                  {item.authorName ? ` · ${item.authorName}` : ""}
                </p>
              </div>
              <ModerationActions
                apiPath={`/api/admin/actualites/${item.id}/moderation`}
                status={item.status}
                rejected={item.rejected}
                canModerate={canModerate}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
