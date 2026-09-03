import SectionHead from "@/components/ui/SectionHead";
import { getMessages } from "@/lib/i18n/locale";

export default async function AboutSection() {
  const t = await getMessages();
  return (
    <section className="py-10 sm:py-14">
      <SectionHead title={t.home.about} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="reveal-item relative rounded-[10px] overflow-hidden h-[300px] sm:h-[360px] md:h-[400px] lg:h-[440px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://solveexample.s2-tastewp.com/wp-content/uploads/2026/08/apropos-illustration-graphique.png"
            alt="Illustration institutionnelle de la DNPEC"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Teinte navy/vert semi-transparente : intègre une photo générique aux couleurs de la charte plutôt que de la laisser brute. */}
          <div className="about-overlay absolute inset-0 pointer-events-none" />
          <div className="flag-strip absolute top-0 left-0 right-0" />
        </div>

        <div className="reveal-item py-2 md:py-4">
          <h3 className="text-2xl sm:text-[28px] lg:text-[30px] text-navy mb-5 leading-snug font-heading font-semibold">
            {t.home.aboutTitle}
          </h3>
          <p className="text-[16px] sm:text-[17px] text-navy/80 leading-[1.75] mb-6">
            {t.home.aboutBody}
          </p>
          <p className="text-[17px] sm:text-lg font-semibold text-navy border-l-4 border-yellow pl-5 italic leading-relaxed">
            {t.home.aboutQuote}
          </p>
        </div>
      </div>
    </section>
  );
}
