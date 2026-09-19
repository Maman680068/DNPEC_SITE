import { notFound } from "next/navigation";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import RpaeModerationPanel from "@/components/admin/rpae/RpaeModerationPanel";
import { getRpaeSubmission } from "@/lib/admin/rpae";
import { getAdminSession } from "@/lib/admin/session";
import { canPublishDirectly } from "@/lib/admin/constants";
import { usageLabel } from "@/lib/rpae";

type PageProps = { params: Promise<{ id: string }> };

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[11.5px] uppercase tracking-wide text-muted font-semibold">{label}</dt>
      <dd className="text-[14.5px] text-navy mt-0.5">{value}</dd>
    </div>
  );
}

export default async function RpaeSubmissionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [item, session] = await Promise.all([getRpaeSubmission(id), getAdminSession()]);
  if (!item) notFound();

  const canModerate = session ? canPublishDirectly(session.roles) : false;
  const { meta } = item;

  return (
    <div className="max-w-3xl">
      <Link
        href="/espace-contributeurs/revue-scientifique"
        className="inline-flex items-center gap-2 text-sm font-semibold text-green hover:text-green-dark transition-colors mb-4"
      >
        <span aria-hidden="true">←</span> Retour à la revue scientifique
      </Link>

      <AdminPageHeader
        title={item.title || "(sans titre)"}
        subtitle={`${item.auteur} · ${formatDate(item.date)}`}
        action={<StatusBadge status={item.status} />}
      />

      <div className="bg-white rounded-lg border border-line p-6 mb-6">
        <h2 className="text-navy font-semibold text-sm mb-4">Auteur</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="Nom complet" value={item.auteur} />
          <InfoRow label="Profil" value={item.profilLabel} />
          <InfoRow label="E-mail" value={meta.emailAuteur} />
          <InfoRow label="Téléphone" value={meta.telephoneAuteur} />
          <InfoRow label="Nationalité" value={meta.nationaliteAuteur} />
          <InfoRow label="Grade" value={meta.gradeAuteur} />
          <InfoRow label="Fonction" value={meta.fonctionAuteur} />
          <InfoRow label="Encadrant" value={meta.encadrant} />
        </dl>
      </div>

      <div className="bg-white rounded-lg border border-line p-6 mb-6">
        <h2 className="text-navy font-semibold text-sm mb-4">Soumission</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <InfoRow label="Thème" value={item.theme} />
          <InfoRow label="Édition" value={item.editionAnnee} />
          <InfoRow label="Destination" value={usageLabel(item.usage)} />
        </dl>
        {meta.resume && (
          <div>
            <dt className="text-[11.5px] uppercase tracking-wide text-muted font-semibold">Résumé</dt>
            <dd className="text-[14.5px] text-ink leading-relaxed mt-1.5 whitespace-pre-line">{meta.resume}</dd>
          </div>
        )}
        {meta.fichierUrl && (
          <a
            href={meta.fichierUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center bg-navy text-white font-bold text-sm px-6 h-11 rounded-lg hover:bg-navy-dark transition-colors"
          >
            Télécharger {meta.fichierNom ? `— ${meta.fichierNom}` : "le fichier joint"}
          </a>
        )}
      </div>

      {canModerate ? (
        <RpaeModerationPanel id={item.id} status={item.status} />
      ) : (
        <p className="text-muted text-sm">
          Seul un administrateur peut valider ou rejeter un article de la revue scientifique.
        </p>
      )}
    </div>
  );
}
