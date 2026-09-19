import PageTitle from "@/components/ui/PageTitle";
import PublicationsExplorer from "@/components/publications/PublicationsExplorer";
import { getPublications } from "@/lib/wordpress";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/publications");
export const revalidate = 300;

type PublicationsPageProps = {
  searchParams: Promise<{ type?: string }>;
};

export default async function PublicationsPage({ searchParams }: PublicationsPageProps) {
  const [publications, params, t] = await Promise.all([getPublications(), searchParams, getMessages()]);

  return (
    <div className="wrap">
      <PageTitle eyebrow={t.home.publicationsEyebrow} title={t.home.publicationsTitle} />
      <section className="pb-14">
        <PublicationsExplorer publications={publications} initialType={params.type ?? ""} />
      </section>
    </div>
  );
}
