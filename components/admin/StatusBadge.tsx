const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  publish: { label: "Publié", className: "bg-green/10 text-green-dark" },
  pending: { label: "En attente de relecture", className: "bg-yellow/20 text-navy-dark" },
  draft: { label: "Brouillon", className: "bg-line text-muted" },
  trash: { label: "Rejeté", className: "bg-red/10 text-red" },
};

export default function StatusBadge({ status }: { status: string }) {
  const info = STATUS_LABELS[status] ?? { label: status, className: "bg-line text-muted" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-semibold ${info.className}`}>
      {info.label}
    </span>
  );
}
