export default function AboutSection() {
  return (
    <section className="pb-14">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="about-visual relative rounded-[10px] overflow-hidden h-[280px] md:h-[340px] flex items-center justify-center">
          <div className="flag-strip absolute top-0 left-0 right-0" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/logo-dnpec-clean.png" alt="" className="h-24 w-auto opacity-90" />
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
