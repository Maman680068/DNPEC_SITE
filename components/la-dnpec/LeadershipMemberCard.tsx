import Link from "next/link";
import LeadershipPhotoPlaceholder from "@/components/la-dnpec/LeadershipPhotoPlaceholder";
import type { LeadershipMember } from "@/lib/leadership-team-data";
import { getLeadershipDisplayName, leadershipBiographyHref } from "@/lib/leadership-team-utils";

type LeadershipMemberCardProps = {
  member: LeadershipMember;
  role: string;
  displayName: string;
  biographyLabel: string;
  localizedHref: (href: string) => string;
  compact?: boolean;
};

export default function LeadershipMemberCard({
  member,
  role,
  displayName,
  biographyLabel,
  localizedHref,
  compact = false,
}: LeadershipMemberCardProps) {
  const photoHeight = compact ? "h-[220px] sm:h-[240px]" : "h-[280px] sm:h-[320px]";

  return (
    <article className="flex flex-col items-center text-center max-w-[280px] mx-auto w-full">
      <div className={`relative w-full ${photoHeight} rounded-lg overflow-hidden shadow-md border border-line bg-white`}>
        {member.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photo}
            alt={displayName}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        ) : (
          <LeadershipPhotoPlaceholder name={displayName} />
        )}
      </div>

      <h3 className={`mt-4 font-bold text-navy leading-snug ${compact ? "text-[15px]" : "text-base sm:text-lg"}`}>
        {displayName}
      </h3>
      <p className={`mt-1.5 text-navy/80 italic leading-snug ${compact ? "text-[13px]" : "text-sm sm:text-[15px]"}`}>
        {role}
      </p>

      <Link
        href={localizedHref(member.biographyHref ?? leadershipBiographyHref(member.id))}
        className="mt-3 text-sm font-semibold text-green hover:text-green-dark transition-colors"
      >
        {biographyLabel}
      </Link>
    </article>
  );
}
