type PageTitleProps = {
  eyebrow: string;
  title: string;
};

export default function PageTitle({ eyebrow, title }: PageTitleProps) {
  return (
    <div className="pt-[34px] pb-5">
      <div className="text-xs font-semibold text-green uppercase tracking-wide">{eyebrow}</div>
      <h1 className="text-[32px] text-navy mt-1.5">{title}</h1>
      <div className="w-[52px] h-1 bg-yellow mt-3" />
    </div>
  );
}
