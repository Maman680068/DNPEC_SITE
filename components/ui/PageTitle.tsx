type PageTitleProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  compact?: boolean;
};

export default function PageTitle({ eyebrow, title, subtitle, compact = false }: PageTitleProps) {
  return (
    <div className={compact ? "pt-4 pb-2" : "pt-[34px] pb-5"}>
      <div className="text-xs font-semibold text-green uppercase tracking-wide">{eyebrow}</div>
      <h1 className={`text-2xl md:text-[32px] text-navy ${compact ? "mt-1" : "mt-1.5"}`}>{title}</h1>
      <div className={`w-[52px] h-1 bg-yellow ${compact ? "mt-2" : "mt-3"}`} />
      {subtitle && (
        <p className={`text-muted text-sm w-full ${compact ? "mt-1.5" : "mt-3"}`}>{subtitle}</p>
      )}
    </div>
  );
}
