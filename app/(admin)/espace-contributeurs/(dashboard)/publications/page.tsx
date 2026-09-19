import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import ModerationActions from "@/components/admin/ModerationActions";
import { listPublications } from "@/lib/admin/data";
import { getAdminSession } from "@/lib/admin/session";
import { canPublishDirectly } from "@/lib/admin/constants";

export default async function PublicationsAdminPage() {
  const [items, session] = await Promise.all([listPublications(), getAdminSession()]);
  const canModerate = session ? canPublishDirectly(session.roles) : false;

  return (
    <div>
      <AdminPageHeader
        title="Publications"
        subtitle="Documents et rapports du site."
        action={
          <Link
            href="/espace-contributeurs/publications/nouveau"
            className="inline-flex items-center justify-center bg-yellow text-navy-dark font-bold text-sm px-5 h-11 rounded-lg hover:brightness-95 transition-[filter]"
          >
            Nouvelle publication
          </Link>
        }
      />

      {items.length === 0 ? (
        <p className="text-muted text-sm">Aucune publication pour le moment.</p>
      ) : (
        <div className="bg-white rounded-lg border border-line divide-y divide-line">
          {items.map((item) => (
            <div key={item.id} className="p-4 flex flex-wrap items-center gap-3 justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/espace-contributeurs/publications/${item.id}`}
                    className="text-navy font-semibold text-[15px] hover:underline"
                  >
                    {item.title || "(sans titre)"}
                  </Link>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-muted text-[13px] mt-1">
                  {item.year ?? "—"}
                  {item.type ? ` · ${item.type}` : ""}
                  {item.authorName ? ` · ${item.authorName}` : ""}
                </p>
              </div>
              <ModerationActions
                apiPath={`/api/admin/publications/${item.id}`}
                status={item.status}
                canModerate={canModerate}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
