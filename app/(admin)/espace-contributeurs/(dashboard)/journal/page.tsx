import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ComingSoon from "@/components/admin/ComingSoon";

export default function JournalAdminPage() {
  return (
    <div>
      <AdminPageHeader
        title="Journal des validations"
        subtitle="Qui a publié ou rejeté quoi, et quand."
      />
      <ComingSoon label="Liste chronologique des validations et rejets" />
    </div>
  );
}
