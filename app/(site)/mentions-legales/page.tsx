import PageTitle from "@/components/ui/PageTitle";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/mentions-legales");

export default async function MentionsLegalesPage() {
  const t = await getMessages();
  return (
    <div className="wrap">
      <PageTitle eyebrow={t.legal.eyebrow} title={t.legal.title} />
      <section className="pb-14 max-w-3xl flex flex-col gap-6 text-[14.5px] text-muted leading-relaxed">
        <div>
          <h2 className="text-navy text-lg font-bold mb-2 font-heading">{t.legalBody.editor}</h2>
          <p>{t.legalBody.editorText}</p>
        </div>
        <div>
          <h2 className="text-navy text-lg font-bold mb-2 font-heading">{t.legalBody.privacy}</h2>
          <p>{t.legalBody.privacyText}</p>
        </div>
      </section>
    </div>
  );
}
