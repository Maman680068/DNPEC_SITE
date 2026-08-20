import { getMessages } from "@/lib/i18n/locale";

export default async function LocaleFallbackNotice({ show }: { show: boolean }) {
  if (!show) return null;
  const t = await getMessages();
  return (
    <p
      role="status"
      className="mb-6 text-sm text-navy bg-yellow/25 border border-yellow/50 rounded-md px-4 py-3"
    >
      {t.common.frenchFallback}
    </p>
  );
}
