import PageTitle from "@/components/ui/PageTitle";
import LeadershipMemberCard from "@/components/la-dnpec/LeadershipMemberCard";
import LeadershipSectionBanner from "@/components/la-dnpec/LeadershipSectionBanner";
import {
  LEADERSHIP_DIRECTION,
  LEADERSHIP_DIVISION_CHIEFS,
  LEADERSHIP_SERVICE_CHIEFS,
  type LeadershipMember,
  type LeadershipRole,
} from "@/lib/leadership-team-data";
import { getLeadershipMemberRole, getLeadershipDisplayName } from "@/lib/leadership-team-utils";
import { getLocale, getMessages } from "@/lib/i18n/locale";
import { localizeHref } from "@/lib/i18n/href";

export default async function LeadershipTeam() {
  const locale = await getLocale();
  const t = await getMessages();
  const href = (path: string) => localizeHref(locale, path);
  const roleFor = (member: LeadershipMember & { role?: LeadershipRole }) =>
    getLeadershipMemberRole(member, locale, t);

  return (
    <div className="wrap">
      <div className="max-w-5xl mx-auto">
        <PageTitle eyebrow={t.nav["/la-dnpec"]} title={t.nav["/la-dnpec/cabinet"]} />

        <section className="pb-14 flex flex-col gap-10">
          <div className="flex flex-col gap-8">
            <LeadershipSectionBanner title={t.leadershipTeam.directionBanner} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-3xl mx-auto w-full">
              {LEADERSHIP_DIRECTION.map((member) => (
                <LeadershipMemberCard
                  key={member.id}
                  member={member}
                  displayName={getLeadershipDisplayName(member, t.leadershipTeam.toBeConfirmed, t.leadershipTeam.civility)}
                  role={roleFor(member)}
                  biographyLabel={t.leadershipTeam.biography}
                  localizedHref={href}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <LeadershipSectionBanner title={t.leadershipTeam.divisionsBanner} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {LEADERSHIP_DIVISION_CHIEFS.map((member) => (
                <LeadershipMemberCard
                  key={member.id}
                  member={member}
                  displayName={getLeadershipDisplayName(member, t.leadershipTeam.toBeConfirmed, t.leadershipTeam.civility)}
                  role={roleFor(member)}
                  biographyLabel={t.leadershipTeam.biography}
                  localizedHref={href}
                  compact
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <LeadershipSectionBanner title={t.leadershipTeam.servicesBanner} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-10 max-w-4xl mx-auto w-full">
              {LEADERSHIP_SERVICE_CHIEFS.map((member) => (
                <LeadershipMemberCard
                  key={member.id}
                  member={member}
                  displayName={getLeadershipDisplayName(member, t.leadershipTeam.toBeConfirmed, t.leadershipTeam.civility)}
                  role={roleFor(member)}
                  biographyLabel={t.leadershipTeam.biography}
                  localizedHref={href}
                  compact
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
