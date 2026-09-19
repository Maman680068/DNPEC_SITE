import InstitutionalPage from "@/components/la-dnpec/InstitutionalPage";
import { getLeadershipDisplayName } from "@/lib/leadership-team-utils";
import { LEADERSHIP_DIRECTION } from "@/lib/leadership-team-data";
import { getMessages } from "@/lib/i18n/locale";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/la-dnpec/mot-du-directeur");
export const revalidate = 300;

export default async function MotDuDirecteurPage() {
  const t = await getMessages();
  const dn = LEADERSHIP_DIRECTION.find((m) => m.id === "dn")!;
  return (
    <InstitutionalPage
      slug="mot-du-directeur-national"
      fallbackTitle={t.nav["/la-dnpec/mot-du-directeur"]}
      photoCaption={{
        name: getLeadershipDisplayName(dn, t.leadershipTeam.toBeConfirmed, t.leadershipTeam.civility),
        role: t.directorTitle,
      }}
    />
  );
}
