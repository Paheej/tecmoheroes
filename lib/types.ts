export type CategoryId =
  | "passing"
  | "rushing"
  | "receiving"
  | "defense"
  | "special-teams"
  | "team";

export type Scope =
  | "single-play"
  | "single-game"
  | "season"
  | "career"
  | "playoff"
  | "super-bowl";

export const STAT_MAX = {
  passingYardsSeason: 6200,
  rushingYardsSeason: 4095,
  receivingYardsSeason: 4095,
  passingTDsSeason: 63,
  rushingTDsSeason: 63,
  receivingTDsSeason: 63,
  rushingAttemptsSeason: 255,
} as const;

export type Position =
  | "QB" | "RB" | "WR" | "TE" | "K" | "P" | "KR" | "PR"
  | "DL" | "DT" | "DE" | "LB" | "DB" | "CB" | "S";

export interface TecmoPlayer {
  id: string;
  slug: string;
  tecmoName: string;
  realName?: string | null;
  position?: Position | null;
  team?: string | null;
  spriteSlug?: string | null;
  avatarSlug?: string | null;
  bio?: string | null;
}

export interface User {
  id: string;
  slug: string;
  displayName: string;
  age?: number | string;
  height?: string;
  ethnicity?: string;
  team?: string;
  from?: string;
  currentResidence?: string;
  seasonsPlayed?: number;
  sbAppearances?: number;
  sbChampionships?: number;
  recordsCount?: number | string;
  bio?: string;
}

export interface Team {
  abbr: string;
  displayName: string;
  fullName: string;
  conference?: "AFC" | "NFC";
  division?: string;
}

export interface Season {
  id: number;
  year: number;
  championTeam?: string;
  runnerUp?: string;
  notes?: string;
}

export interface Record {
  id: string;
  category: CategoryId;
  scope: Scope;
  statName: string;
  value: number | string;
  unit?: string;
  tecmoPlayerIds: string[];
  userIds: string[];
  teamAbbrs: string[];
  seasonId?: number | null;
  dateAchieved?: string | null;
  asterisk?: boolean;
  notes?: string;
}

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  blurb: string;
}
