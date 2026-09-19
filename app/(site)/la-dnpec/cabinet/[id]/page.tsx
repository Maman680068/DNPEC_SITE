import { notFound, redirect } from "next/navigation";
import LeadershipBiography from "@/components/la-dnpec/LeadershipBiography";
import {
  getAllLeadershipMemberIds,
  getLeadershipDisplayName,
  getLeadershipMemberById,
  getLeadershipMemberRole,
} from "@/lib/leadership-team-utils";
import { getLocale, getMessages } from "@/lib/i18n/locale";
import { localizeHref } from "@/lib/i18n/href";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getAllLeadershipMemberIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const member = getLeadershipMemberById(id);
  if (!member) return {};
  const locale = await getLocale();
  const t = await getMessages();
  const name = getLeadershipDisplayName(member, t.leadershipTeam.toBeConfirmed, t.leadershipTeam.civility);
  const role = getLeadershipMemberRole(member, locale, t);
  return {
    title: `${t.leadershipTeam.biography} — ${name}`,
    description: `${name} — ${role}`,
  };
}

export const revalidate = 300;

export default async function LeadershipBiographyPage({ params }: PageProps) {
  const { id } = await params;
  const member = getLeadershipMemberById(id);
  if (!member) notFound();

  if (member.biographyHref) {
    const locale = await getLocale();
    redirect(localizeHref(locale, member.biographyHref));
  }

  return <LeadershipBiography member={member} />;
}
