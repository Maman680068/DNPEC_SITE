import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { listJournal } from "@/lib/admin/data";

const ACTION_LABELS: Record<string, string> = {
  publier: "a publié",
  rejeter: "a rejeté",
};

const ENTITY_LABELS: Record<string, string> = {
  actualite: "un article",
  publication: "une publication",
  indicateur: "un indicateur",
  partenaire: "un partenaire",
  rpae: "un article RPAE",
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
}

export default async function JournalAdminPage() {
  const entries = await listJournal();

  return (
    <div>
      <AdminPageHeader
        title="Journal des validations"
        subtitle="Qui a publié ou rejeté quoi, et quand."
      />

      {entries.length === 0 ? (
        <p className="text-muted text-sm">Aucune validation ou rejet enregistré pour le moment.</p>
      ) : (
        <div className="bg-white rounded-lg border border-line divide-y divide-line">
          {entries.map((entry) => (
            <div key={entry.id} className="p-4">
              <p className="text-[14.5px] text-navy">
                <span className="font-semibold">{entry.actorName || "Quelqu'un"}</span>{" "}
                {ACTION_LABELS[entry.action] ?? entry.action}{" "}
                {ENTITY_LABELS[entry.entityType] ?? entry.entityType} :{" "}
                <span className="font-medium">{entry.entityTitle}</span>
              </p>
              <p className="text-muted text-[12.5px] mt-1">{formatDate(entry.date)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
