import PageTitle from "@/components/ui/PageTitle";
import ContactForm from "@/components/contact/ContactForm";
import { getMessages } from "@/lib/i18n/locale";

export default async function ContactPage() {
  const t = await getMessages();
  return (
    <div className="wrap">
      <PageTitle eyebrow={t.contact.eyebrow} title={t.contact.title} subtitle={t.contact.subtitle} />

      <section className="pb-14 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10">
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-lg border border-line p-6 text-[14.5px] leading-loose text-muted">
            <h2 className="text-navy text-base font-bold mb-3 font-heading">{t.form.details}</h2>
            <div className="flex flex-col gap-2">
              <div>
                <span className="text-navy font-semibold">{t.form.phone} :</span> +224 662 46 45 67
              </div>
              <div>
                <span className="text-navy font-semibold">{t.form.email} :</span> infos@dnpec.gov.gn
              </div>
              <div>
                <span className="text-navy font-semibold">{t.form.addressLabel} :</span> {t.form.addressValue}
              </div>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden border border-line h-[220px]">
            <iframe
              src="https://maps.google.com/maps?q=Kaloum,+Conakry,+Guin%C3%A9e&z=14&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t.form.mapTitle}
            />
          </div>
        </div>

        <ContactForm heading={t.form.concernHeading} />
      </section>
    </div>
  );
}
