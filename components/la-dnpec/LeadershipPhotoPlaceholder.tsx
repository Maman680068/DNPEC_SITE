export default function LeadershipPhotoPlaceholder({ name }: { name: string }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#e8ecf2] to-[#d5dce8] text-navy/35"
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" className="w-16 h-16 sm:w-24 sm:h-24" fill="currentColor">
        <circle cx="32" cy="22" r="12" />
        <path d="M12 56c2.5-14 12-20 20-20s17.5 6 20 20" />
      </svg>
      <span className="sr-only">{name}</span>
    </div>
  );
}
