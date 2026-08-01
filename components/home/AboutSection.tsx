export default function AboutSection() {
  return (
    <section className="pb-14">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="relative rounded-[10px] overflow-hidden h-[280px] md:h-[340px]">
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

        <div>
          <div className="text-xs font-semibold text-green uppercase tracking-wide">A-Propos</div>
          <h2 className="text-[26px] text-navy mt-1.5 mb-4 leading-snug">
            Direction Nationale des Prévisions Économiques et de la Conjoncture
          </h2>
          <p className="text-[15px] text-muted leading-relaxed mb-5">
            La DNPEC, sous l&apos;autorité du Ministère de l&apos;Économie et des Finances, est responsable de la
            conception et du suivi de la politique économique à court terme du Gouvernement. Ses missions
            incluent la publication de bulletins économiques, la création d&apos;outils de prévision, la
            réalisation d&apos;études économiques, et la coordination des activités du Comité National de
            coordination des politiques macroéconomiques et monétaires...
          </p>
          <p className="text-base font-semibold text-navy border-l-4 border-yellow pl-4 italic">
            Anticiper, Analyser, Agir pour une économie résiliente et performante.
          </p>
        </div>
      </div>
    </section>
  );
}
