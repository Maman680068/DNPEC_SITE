import type { Metadata } from "next";
import PageTitle from "@/components/ui/PageTitle";
import PublicationsExplorer from "@/components/publications/PublicationsExplorer";
import { getPublications } from "@/lib/wordpress";

export const metadata: Metadata = { title: "Publications" };

type PublicationsPageProps = {
  searchParams: Promise<{ type?: string }>;
};

export default async function PublicationsPage({ searchParams }: PublicationsPageProps) {
  const [publications, params] = await Promise.all([getPublications(), searchParams]);

  return (
    <div className="wrap">
      <PageTitle eyebrow="Publications" title="Retrouvez l'information économique" />
      <section className="pb-14">
        <PublicationsExplorer publications={publications} initialType={params.type ?? ""} />
      </section>
    </div>
  );
}
