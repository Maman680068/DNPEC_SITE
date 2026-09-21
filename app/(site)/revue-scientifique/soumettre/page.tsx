import PageTitle from "@/components/ui/PageTitle";
import RpaeSubmissionForm from "@/components/revue/RpaeSubmissionForm";
import { getMessages } from "@/lib/i18n/locale";

export default async function SoumettreArticlePage() {
  const t = await getMessages();
  return (
    <div className="wrap">
      <div className="max-w-4xl mx-auto">
        <PageTitle eyebrow={t.revue.title} title={t.revue.submitTitle} subtitle={t.revue.submitSubtitle} />
        <section className="pb-14">
          <RpaeSubmissionForm />
        </section>
      </div>
    </div>
  );
}
