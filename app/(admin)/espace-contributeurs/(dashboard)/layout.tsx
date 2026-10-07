import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/session";
import { roleLabel, ADMIN_SESSION_EXPIRED_PATH } from "@/lib/admin/constants";
import AdminShell from "@/components/admin/AdminShell";

/**
 * Filet de sécurité côté serveur en plus du middleware (qui ne vérifie que
 * la présence du cookie) : la session est relue et sa signature vérifiée.
 * Absente, modifiée ou expirée → effacée, puis retour à la connexion.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) {
    redirect(ADMIN_SESSION_EXPIRED_PATH);
  }

  return (
    <AdminShell name={session.name} roleLabel={roleLabel(session.roles)}>
      {children}
    </AdminShell>
  );
}
