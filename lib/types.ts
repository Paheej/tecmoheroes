export type CategoryId =
  | "passing"
  | "rushing"
  | "receiving"
  | "defense"
  | "special-teams"
  | "team";

export type CategoryGroupId =
  | "offense"
  | "defense-special-teams"
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
  /** tecmogeek-style team-slug (e.g. "raiders") used for sprite-sheet lookup. */
  teamSlug?: string | null;
  /** Index into the team sprite-sheet (0 = QB1, 1 = QB2, etc.). */
  spriteIndex?: number | null;
  bio?: string | null;
}

export interface User {
  id: string;
  slug: string;
  displayName: string;
  shortName?: string;
  age?: number | string;
  height?: string;
  ethnicity?: string;
  team?: string;
  from?: string;
  currentResidence?: string;
  seasonsPlayed?: number | string;
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

export interface SuperBowlGame {
  champion: string;
  championUser?: string | null;
  championScore: number;
  runnerUp: string;
  runnerUpUser?: string | null;
  runnerUpScore: number;
  afc?: string | null;
  nfc?: string | null;
  afcUser?: string | null;
  nfcUser?: string | null;
  afcScore?: number;
  nfcScore?: number;
  location?: string | null;
  notes?: string | null;
}

export interface Season {
  id: number;
  year: number;
  championTeam?: string;
  runnerUp?: string;
  notes?: string;
  superBowl?: SuperBowlGame;
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
  /** All seasons that hold the record (for ties). Always populated for records derived from the spreadsheet. */
  seasonIds?: number[];
  /** All years that hold the record (for ties). */
  years?: number[];
  dateAchieved?: string | null;
  asterisk?: boolean;
  notes?: string;
}

export interface TeamSeason {
  seasonId: number;
  year: number | null;
  team: string;
  userId: string;
  w: number;
  l: number;
  t: number;
  pf: number;
  pa: number;
  diff?: number | null;
  totalOff?: number | null;
  passOff?: number | null;
  rushOff?: number | null;
  totalDef?: number | null;
  passDef?: number | null;
  rushDef?: number | null;
  wonSuperBowl?: boolean;
}

/** A single per-player per-season statline row pulled from one stat sheet. */
export interface PlayerSeasonStat {
  playerId: string;
  userId: string;
  team?: string | null;
  seasonId: number;
  year?: number | null;
  sheet: string;
  // Passing
  passAttempts?: number;
  completions?: number;
  completionPct?: number;
  passYards?: number;
  passYdsPerAtt?: number;
  passTDs?: number;
  interceptions?: number;
  qbRating?: number;
  // Receiving
  receptions?: number;
  recYards?: number;
  recYdsPerCatch?: number;
  recTDs?: number;
  // Rushing
  rushAttempts?: number;
  rushYards?: number;
  rushYdsPerAtt?: number;
  rushTDs?: number;
  // Scoring
  points?: number;
  // Special teams
  puntReturns?: number;
  puntRetYards?: number;
  puntRetAvg?: number;
  puntRetTDs?: number;
  kickReturns?: number;
  kickRetYards?: number;
  kickRetAvg?: number;
  kickRetTDs?: number;
  punts?: number;
  puntYards?: number;
  puntAvg?: number;
  // Defense
  sacks?: number;
  defInterceptions?: number;
}

export interface CategoryMeta {
  id: CategoryGroupId;
  label: string;
  blurb: string;
  subcategories: CategoryId[];
}
