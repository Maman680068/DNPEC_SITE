import PageTitle from "@/components/ui/PageTitle";
import ContactForm from "@/components/contact/ContactForm";
import DirecteurNationalCard from "@/components/contact/DirecteurNationalCard";
import { getMessages } from "@/lib/i18n/locale";

const DIRECTEUR_PHOTO =
  "https://solveexample.s2-tastewp.com/wp-content/uploads/2026/08/directeur-national-dnpec.jpg";
const DIRECTEUR_NAME = "Abdoulaye Ibrahima Diallo";

export default async function EcrireAuDirecteurNationalPage() {
  const t = await getMessages();
  return (
    <div className="wrap">
      <PageTitle eyebrow={t.contact.eyebrow} title={t.contact.writeTitle} subtitle={t.contact.writeSubtitle} />

      <section className="pb-14 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10">
        <ContactForm context="directeur-national" />
        <DirecteurNationalCard photo={DIRECTEUR_PHOTO} name={DIRECTEUR_NAME} title={t.directorTitleFull} />
      </section>
    </div>
  );
}
