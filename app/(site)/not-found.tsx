import type { Metadata } from "next";
import LocalizedLink from "@/components/i18n/LocalizedLink";
import { getMessages } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.notFound.title, robots: { index: false } };
}

export default async function PageIntrouvable() {
  const t = await getMessages();
  return (
    <div className="wrap flex flex-col items-center justify-center text-center min-h-[55vh] py-16">
      <p className="text-green font-semibold text-sm uppercase tracking-wide">{t.notFound.code}</p>
      <h1 className="mt-2 text-2xl md:text-[32px] text-navy">{t.notFound.title}</h1>
      <div className="w-[52px] h-1 bg-yellow mt-3" />
      <p className="mt-5 text-muted max-w-md">{t.notFound.body}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <LocalizedLink
          href="/"
          className="inline-flex items-center justify-center bg-yellow text-navy-dark font-bold text-sm px-6 h-11 rounded-lg hover:brightness-95 transition-[filter]"
        >
          {t.notFound.home}
        </LocalizedLink>
        <LocalizedLink
          href="/actualites"
          className="inline-flex items-center justify-center border border-navy text-navy font-semibold text-sm px-6 h-11 rounded-lg hover:bg-navy hover:text-white transition-colors"
        >
          {t.notFound.news}
        </LocalizedLink>
      </div>
    </div>
  );
}
