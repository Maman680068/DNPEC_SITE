type LeadershipSectionBannerProps = {
  title: string;
  as?: "h1" | "h2";
  className?: string;
};

export default function LeadershipSectionBanner({
  title,
  as: Tag = "h2",
  className = "",
}: LeadershipSectionBannerProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-gradient-to-r from-navy-dark via-navy to-[#1c4578] py-3.5 px-6 text-center shadow-[0_4px_16px_rgba(19,43,94,0.28)] ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, white 0%, transparent 45%), radial-gradient(circle at 80% 50%, white 0%, transparent 40%)",
        }}
      />
      <Tag className="relative text-base sm:text-lg font-bold text-white tracking-wide">{title}</Tag>
    </div>
  );
}
