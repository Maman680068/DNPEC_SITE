import LeadershipTeam from "@/components/la-dnpec/LeadershipTeam";
import { navTitleMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = () => navTitleMetadata("/la-dnpec/cabinet");
export const revalidate = 300;

export default function Page() {
  return <LeadershipTeam />;
}
