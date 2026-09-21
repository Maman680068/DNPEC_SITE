import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/session";
import { roleLabel, ADMIN_LOGIN_PATH } from "@/lib/admin/constants";
import AdminShell from "@/components/admin/AdminShell";

/**
 * Filet de sécurité côté serveur en plus du middleware (qui ne vérifie que
 * la présence du cookie) : ici on lit vraiment la session pour l'affichage,
 * et on redirige si elle est absente ou corrompue.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) {
    redirect(ADMIN_LOGIN_PATH);
  }

  return (
    <AdminShell name={session.name} roleLabel={roleLabel(session.roles)}>
      {children}
    </AdminShell>
  );
}
