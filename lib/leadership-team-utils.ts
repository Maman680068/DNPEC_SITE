import type { Locale } from "@/lib/i18n/config";
import { ORG_LEGEND } from "@/lib/organigramme-data";
import {
  LEADERSHIP_DIRECTION,
  LEADERSHIP_DIVISION_CHIEFS,
  LEADERSHIP_SERVICE_CHIEFS,
  type LeadershipMember,
  type LeadershipRole,
} from "@/lib/leadership-team-data";

type LeadershipMessages = {
  directorTitle: string;
  leadershipTeam: {
    deputyDirector: string;
    divisionChief: string;
    serviceChief: string;
    toBeConfirmed: string;
  };
};

export function leadershipBiographyHref(id: string): string {
  return `/la-dnpec/cabinet/${id}`;
}

export function getAllLeadershipMemberIds(): string[] {
  return [
    ...LEADERSHIP_DIRECTION.map((m) => m.id),
    ...LEADERSHIP_DIVISION_CHIEFS.map((m) => m.id),
    ...LEADERSHIP_SERVICE_CHIEFS.map((m) => m.id),
  ];
}

export function getLeadershipMemberById(id: string): (LeadershipMember & { role?: LeadershipRole }) | null {
  const fromDirection = LEADERSHIP_DIRECTION.find((m) => m.id === id);
  if (fromDirection) return fromDirection;
  const fromDivision = LEADERSHIP_DIVISION_CHIEFS.find((m) => m.id === id);
  if (fromDivision) return fromDivision;
  const fromService = LEADERSHIP_SERVICE_CHIEFS.find((m) => m.id === id);
  if (fromService) return fromService;
  return null;
}

export function unitLabel(code: string, locale: Locale): string {
  const entry = ORG_LEGEND.find((item) => item.code === code);
  if (!entry) return code;
  if (locale === "fr") return entry.label;
  const en: Record<string, string> = {
    DPE: "Economic Forecasting Division",
    DEE: "Economic Studies Division",
    DSPS: "Economic Policy Monitoring Division",
    DAC: "Business Cycle Analysis Division",
    DIPE: "Economic Integration and Partnerships Division",
    SAF: "Administrative and Financial Service",
    RH: "Human Resources",
    CSID: "Information Systems and Digitalization Unit",
  };
  return en[code] ?? entry.label;
}

export function getLeadershipMemberRole(
  member: LeadershipMember & { role?: LeadershipRole },
  locale: Locale,
  t: LeadershipMessages,
): string {
  if (member.role === "dn") return t.directorTitle;
  if (member.role === "dna") return t.leadershipTeam.deputyDirector;
  if (member.unitCode) {
    const isService = LEADERSHIP_SERVICE_CHIEFS.some((m) => m.id === member.id);
    const prefix = isService ? t.leadershipTeam.serviceChief : t.leadershipTeam.divisionChief;
    return `${prefix} — ${unitLabel(member.unitCode, locale)}`;
  }
  return "";
}

export function formatPersonName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name;
  const lastIndex = parts.length - 1;
  parts[lastIndex] = parts[lastIndex]!.toLocaleUpperCase("fr-FR");
  return parts.join(" ");
}

export function getLeadershipDisplayName(
  member: LeadershipMember,
  toBeConfirmedLabel: string,
  civility: string,
): string {
  if (!member.name) return toBeConfirmedLabel;
  return `${civility} ${formatPersonName(member.name)}`;
}
