import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminError from "@/components/admin/AdminError";
import StatusBadge from "@/components/admin/StatusBadge";
import ModerationActions from "@/components/admin/ModerationActions";
import ImportDefaultsButton from "@/components/admin/ImportDefaultsButton";
import { listPublications } from "@/lib/admin/data";
import { readAdminResult } from "@/lib/admin/page-data";
import { getAdminSession } from "@/lib/admin/session";
import { canModerate as rolesCanModerate, isAdministrator } from "@/lib/admin/constants";
import { mockPublications, publicationTypes } from "@/lib/mock-data";

function typeLabel(value: string): string {
  return publicationTypes.find((t) => t.value === value)?.label ?? value;
}

export default async function PublicationsAdminPage() {
  const [result, session] = await Promise.all([listPublications(), getAdminSession()]);
  const { data, error } = readAdminResult(result);
  const items = data ?? [];
  const canModerate = session ? rolesCanModerate(session.roles) : false;
  const existingSlugs = new Set(items.map((item) => item.slug));
  const missingDefaults = mockPublications.filter((entry) => !existingSlugs.has(entry.slug)).length;

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

      {!error && session && isAdministrator(session.roles) && (
        <ImportDefaultsButton type="publications" missing={missingDefaults} />
      )}

      {error ? (
        <AdminError message={error} />
      ) : items.length === 0 ? (
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
                  <StatusBadge status={item.status} rejected={item.rejected} />
                </div>
                <p className="text-muted text-[13px] mt-1">
                  {item.year ?? "—"}
                  {item.type ? ` · ${typeLabel(item.type)}` : ""}
                  {item.fileUrl ? " · PDF joint" : ""}
                  {item.authorName ? ` · ${item.authorName}` : ""}
                </p>
              </div>
              <ModerationActions
                apiPath={`/api/admin/publications/${item.id}/moderation`}
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
