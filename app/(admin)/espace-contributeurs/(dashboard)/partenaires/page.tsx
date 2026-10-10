import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminError from "@/components/admin/AdminError";
import StatusBadge from "@/components/admin/StatusBadge";
import ModerationActions from "@/components/admin/ModerationActions";
import ImportDefaultsButton from "@/components/admin/ImportDefaultsButton";
import { listPartenaires } from "@/lib/admin/data";
import { readAdminResult } from "@/lib/admin/page-data";
import { getAdminSession } from "@/lib/admin/session";
import { canModerate as rolesCanModerate, isAdministrator } from "@/lib/admin/constants";
import { mockPartners } from "@/lib/mock-data";

export default async function PartenairesAdminPage() {
  const [result, session] = await Promise.all([listPartenaires(), getAdminSession()]);
  const { data, error } = readAdminResult(result);
  const items = data ?? [];
  const canModerate = session ? rolesCanModerate(session.roles) : false;
  const existingSlugs = new Set(items.map((item) => item.slug));
  const missingDefaults = mockPartners.filter((entry) => !existingSlugs.has(entry.id)).length;

  return (
    <div>
      <AdminPageHeader
        title="Partenaires"
        subtitle="Logos et liens partenaires affichés sur l'accueil."
        action={
          <Link
            href="/espace-contributeurs/partenaires/nouveau"
            className="inline-flex items-center justify-center bg-yellow text-navy-dark font-bold text-sm px-5 h-11 rounded-lg hover:brightness-95 transition-[filter]"
          >
            Nouveau partenaire
          </Link>
        }
      />

      {!error && session && isAdministrator(session.roles) && (
        <ImportDefaultsButton type="partenaires" missing={missingDefaults} />
      )}

      {error ? (
        <AdminError message={error} />
      ) : items.length === 0 ? (
        <p className="text-muted text-sm">Aucun partenaire pour le moment.</p>
      ) : (
        <div className="bg-white rounded-lg border border-line divide-y divide-line">
          {items.map((item) => (
            <div key={item.id} className="p-4 flex flex-wrap items-center gap-3 justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/espace-contributeurs/partenaires/${item.id}`}
                    className="text-navy font-semibold text-[15px] hover:underline"
                  >
                    {item.name || "(sans titre)"}
                  </Link>
                  <StatusBadge status={item.status} rejected={item.rejected} />
                </div>
                <p className="text-muted text-[13px] mt-1">
                  {item.websiteUrl ?? "Sans site web"}
                  {item.authorName ? ` · ${item.authorName}` : ""}
                </p>
              </div>
              <ModerationActions
                apiPath={`/api/admin/partenaires/${item.id}/moderation`}
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
