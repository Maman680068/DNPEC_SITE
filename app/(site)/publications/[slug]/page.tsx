import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import ContentPlaceholder from "@/components/ui/ContentPlaceholder";
import { getPublications } from "@/lib/wordpress";
import { getLocale, getMessages } from "@/lib/i18n/locale";
import { dateLocale, type Locale } from "@/lib/i18n/config";

function formatSize(sizeKb: number, locale: Locale): string {
  if (sizeKb < 1024) return `${sizeKb.toLocaleString(dateLocale(locale))} ${locale === "en" ? "KB" : "Ko"}`;
  const mb = (sizeKb / 1024).toLocaleString(dateLocale(locale), { maximumFractionDigits: 1 });
  return `${mb} ${locale === "en" ? "MB" : "Mo"}`;
}

type PublicationPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: PublicationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const publications = await getPublications();
  const publication = publications.find((p) => p.slug === slug);
  return { title: publication?.title ?? "Publication" };
}

export default async function PublicationPage({ params }: PublicationPageProps) {
  const { slug } = await params;
  const [t, locale] = await Promise.all([getMessages(), getLocale()]);
  const publications = await getPublications();
  const publication = publications.find((p) => p.slug === slug);

  if (!publication) notFound();

  return (
    <div className="wrap">
      <PageTitle eyebrow={t.nav["/publications"]} title={publication.title} />
      <section className="pb-14 max-w-3xl">
        <p className="text-[15px] text-muted leading-relaxed mb-6">{publication.description}</p>
        {publication.fileUrl ? (
          <a
            href={publication.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-navy text-white font-bold text-sm px-6 h-11 rounded-lg hover:bg-navy-dark transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" aria-hidden="true">
              <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t.ui.downloadPdf}
            {publication.fileSizeKb ? ` (PDF, ${formatSize(publication.fileSizeKb, locale)})` : " (PDF)"}
          </a>
        ) : (
          <ContentPlaceholder>
            {t.ui.pdfPending.replace("{year}", String(publication.year))}
          </ContentPlaceholder>
        )}
      </section>
    </div>
  );
}
