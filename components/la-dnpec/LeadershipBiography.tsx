import Link from "next/link";
import LeadershipPhotoPlaceholder from "@/components/la-dnpec/LeadershipPhotoPlaceholder";
import LeadershipSectionBanner from "@/components/la-dnpec/LeadershipSectionBanner";
import { getLeadershipDisplayName, getLeadershipMemberRole } from "@/lib/leadership-team-utils";
import type { LeadershipMember, LeadershipRole } from "@/lib/leadership-team-data";
import { getLocale, getMessages } from "@/lib/i18n/locale";
import { localizeHref } from "@/lib/i18n/href";

type LeadershipBiographyProps = {
  member: LeadershipMember & { role?: LeadershipRole };
};

export default async function LeadershipBiography({ member }: LeadershipBiographyProps) {
  const locale = await getLocale();
  const t = await getMessages();
  const displayName = getLeadershipDisplayName(member, t.leadershipTeam.toBeConfirmed, t.leadershipTeam.civility);
  const role = getLeadershipMemberRole(member, locale, t);
  const cabinetHref = localizeHref(locale, "/la-dnpec/cabinet");

  return (
    <div className="wrap">
      <div className="max-w-2xl mx-auto pb-14">
        <Link
          href={cabinetHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-green hover:text-green-dark transition-colors"
        >
          <span aria-hidden="true">←</span>
          {t.leadershipTeam.backToLeaders}
        </Link>

        <article className="mt-6 overflow-hidden rounded-lg border border-line bg-white shadow-[0_8px_32px_rgba(19,43,94,0.06)]">
          <LeadershipSectionBanner title={displayName} as="h1" className="rounded-none shadow-none" />

          <div className="flex flex-col items-center px-6 py-8 sm:py-10">
            <div className="relative w-full max-w-[300px] h-[320px] sm:h-[360px] overflow-hidden rounded-lg border border-line bg-white shadow-md">
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

            <p className="mt-6 text-base sm:text-lg text-navy italic text-center leading-snug">{role}</p>

            {member.biography?.[locale] ? (
              <div
                className="article-content mt-8 w-full text-[15px] text-ink leading-relaxed"
                dangerouslySetInnerHTML={{ __html: member.biography[locale]! }}
              />
            ) : (
              <p className="mt-8 text-center text-muted text-[15px] leading-relaxed max-w-md">
                {t.leadershipTeam.biographyPending}
              </p>
            )}
          </div>
        </article>

        <div className="mt-6 text-center">
          <Link
            href={cabinetHref}
            className="text-sm font-semibold text-green hover:text-green-dark transition-colors"
          >
            {t.leadershipTeam.backToLeaders}
          </Link>
        </div>
      </div>
    </div>
  );
}
