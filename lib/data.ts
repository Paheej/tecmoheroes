import categoriesJson from "@/data/categories.json";
import recordsJson from "@/data/records.json";
import playersJson from "@/data/players.json";
import usersJson from "@/data/users.json";
import teamsJson from "@/data/teams.json";
import seasonsJson from "@/data/seasons.json";
import teamSeasonsJson from "@/data/team-seasons.json";
import playerStatsJson from "@/data/player-stats.json";
import type {
  CategoryId,
  CategoryGroupId,
  CategoryMeta,
  Record,
  TecmoPlayer,
  User,
  Team,
  Season,
  TeamSeason,
  PlayerSeasonStat,
} from "./types";

export const CATEGORY_GROUPS: globalThis.Record<CategoryGroupId, CategoryId[]> = {
  "offense": ["passing", "rushing", "receiving"],
  "defense-special-teams": ["defense", "special-teams"],
  "team": ["team"],
};

export const SUBCATEGORY_LABEL: globalThis.Record<CategoryId, string> = {
  passing: "Passing",
  rushing: "Rushing",
  receiving: "Receiving",
  defense: "Defense",
  "special-teams": "Special Teams",
  team: "Team",
};

export const categories = categoriesJson as CategoryMeta[];
export const records = recordsJson as Record[];
export const players = playersJson as TecmoPlayer[];
export const users = usersJson as User[];
export const teams = teamsJson as Team[];
export const seasons = seasonsJson as Season[];
export const teamSeasons = teamSeasonsJson as TeamSeason[];
export const playerStats = playerStatsJson as PlayerSeasonStat[];

export const playerById = new Map(players.map((p) => [p.id, p]));
export const playerBySlug = new Map(players.map((p) => [p.slug, p]));
export const userById = new Map(users.map((u) => [u.id, u]));
export const userBySlug = new Map(users.map((u) => [u.slug, u]));
export const teamByAbbr = new Map(teams.map((t) => [t.abbr, t]));
export const seasonById = new Map(seasons.map((s) => [s.id, s]));
export const categoryById = new Map(categories.map((c) => [c.id, c]));

export function recordsByCategory(id: CategoryId): Record[] {
  return records.filter((r) => r.category === id);
}

export function recordsByCategoryGroup(id: CategoryGroupId): Record[] {
  const subs = CATEGORY_GROUPS[id];
  const set = new Set<CategoryId>(subs);
  return records.filter((r) => set.has(r.category));
}

export function recordsForPlayer(playerId: string): Record[] {
  return records.filter((r) => r.tecmoPlayerIds.includes(playerId));
}

export function recordsForUser(userId: string): Record[] {
  return records.filter((r) => r.userIds.includes(userId));
}

export function recordsForTeam(abbr: string): Record[] {
  return records.filter((r) => r.teamAbbrs.includes(abbr));
}

export function recordsForSeason(id: number): Record[] {
  return records.filter((r) => r.seasonId === id);
}

// --- Record classification ----------------------------------------------------
// Records JSON mixes three different things: actual statistical records,
// season awards (MVP/OPOY/DPOY), and Super Bowl championship entries. The
// classification helpers below split them so stat records, awards, and
// championships can be displayed in their own sections.

const AWARD_RE = /Season \d+ (MVP|OPOY|DPOY)/;
const CHAMPIONSHIP_RE = /Super Bowl \d+ Champion/i;

export function isAwardRecord(r: Record): boolean {
  return AWARD_RE.test(r.statName);
}

export function isChampionshipRecord(r: Record): boolean {
  return r.scope === "super-bowl" && CHAMPIONSHIP_RE.test(r.statName);
}

export function isStatRecord(r: Record): boolean {
  return !isAwardRecord(r) && !isChampionshipRecord(r);
}

export type AwardKind = "MVP" | "OPOY" | "DPOY";

export function awardKind(r: Record): AwardKind | null {
  const m = r.statName.match(/(MVP|OPOY|DPOY)/);
  return (m?.[1] as AwardKind) ?? null;
}

export const statRecords = records.filter(isStatRecord);
export const awardRecords = records.filter(isAwardRecord);
export const championshipRecords = records.filter(isChampionshipRecord);

export function statRecordsByCategory(id: CategoryId): Record[] {
  return statRecords.filter((r) => r.category === id);
}

export function statRecordsByCategoryGroup(id: CategoryGroupId): Record[] {
  const set = new Set<CategoryId>(CATEGORY_GROUPS[id]);
  return statRecords.filter((r) => set.has(r.category));
}

export function statRecordsForSeason(id: number): Record[] {
  return statRecords.filter((r) => r.seasonId === id);
}

export function awardsForSeason(id: number): Record[] {
  return awardRecords.filter((r) => r.seasonId === id);
}

export function awardsForPlayer(playerId: string): Record[] {
  return awardRecords.filter((r) => r.tecmoPlayerIds.includes(playerId));
}

export function awardsForUser(userId: string): Record[] {
  return awardRecords.filter((r) => r.userIds.includes(userId));
}

// --- Super Bowl appearances ---------------------------------------------------
// Sourced from seasons.json so every game is represented exactly once,
// regardless of whether records.json carries a corresponding championship row.

export interface SBAppearance {
  seasonId: number;
  year: number;
  team: string;
  userId?: string | null;
  scoreFor: number;
  opponentTeam: string;
  opponentUserId?: string | null;
  scoreAgainst: number;
  won: boolean;
}

export const sbAppearances: SBAppearance[] = seasons.flatMap((s) => {
  const sb = s.superBowl;
  if (!sb) return [];
  return [
    {
      seasonId: s.id,
      year: s.year,
      team: sb.champion,
      userId: sb.championUser ?? null,
      scoreFor: sb.championScore,
      opponentTeam: sb.runnerUp,
      opponentUserId: sb.runnerUpUser ?? null,
      scoreAgainst: sb.runnerUpScore,
      won: true,
    },
    {
      seasonId: s.id,
      year: s.year,
      team: sb.runnerUp,
      userId: sb.runnerUpUser ?? null,
      scoreFor: sb.runnerUpScore,
      opponentTeam: sb.champion,
      opponentUserId: sb.championUser ?? null,
      scoreAgainst: sb.championScore,
      won: false,
    },
  ];
});

export function sbAppearancesForUser(userId: string): SBAppearance[] {
  return sbAppearances.filter((a) => a.userId === userId);
}

export function championshipsForUser(userId: string): SBAppearance[] {
  return sbAppearances.filter((a) => a.userId === userId && a.won);
}

// --- Team-season helpers ----------------------------------------------------

export function teamSeasonsForUser(userId: string): TeamSeason[] {
  return teamSeasons.filter((ts) => ts.userId === userId);
}

export function teamSeasonsForSeason(seasonId: number): TeamSeason[] {
  return teamSeasons.filter((ts) => ts.seasonId === seasonId);
}

/**
 * Team the user played most across recorded seasons. Tiebreak: best
 * combined W/L record on that team (highest win pct, then most wins).
 */
export function mostPlayedTeamForUser(userId: string): {
  team: string;
  seasons: number;
  w: number;
  l: number;
  t: number;
} | null {
  const rows = teamSeasonsForUser(userId);
  if (rows.length === 0) return null;
  const byTeam = new Map<string, { team: string; seasons: number; w: number; l: number; t: number }>();
  for (const r of rows) {
    const cur = byTeam.get(r.team) ?? { team: r.team, seasons: 0, w: 0, l: 0, t: 0 };
    cur.seasons += 1;
    cur.w += r.w ?? 0;
    cur.l += r.l ?? 0;
    cur.t += r.t ?? 0;
    byTeam.set(r.team, cur);
  }
  const sorted = [...byTeam.values()].sort((a, b) => {
    if (b.seasons !== a.seasons) return b.seasons - a.seasons;
    const wpa = a.w + a.l + a.t === 0 ? 0 : (a.w + a.t * 0.5) / (a.w + a.l + a.t);
    const wpb = b.w + b.l + b.t === 0 ? 0 : (b.w + b.t * 0.5) / (b.w + b.l + b.t);
    if (wpb !== wpa) return wpb - wpa;
    return b.w - a.w;
  });
  return sorted[0] ?? null;
}

// --- Player-season stat helpers --------------------------------------------

export function playerStatsForPlayer(playerId: string): PlayerSeasonStat[] {
  return playerStats.filter((s) => s.playerId === playerId);
}

interface CategoryPersonalBest {
  category: CategoryId;
  statName: string;
  value: number;
  unit?: string;
  seasonId: number;
  year?: number | null;
  team?: string | null;
}

const STAT_DEFS: Array<{
  category: CategoryId;
  statName: string;
  key: keyof PlayerSeasonStat;
  unit?: string;
  /** Lower is better (e.g. fewest interceptions). */
  ascending?: boolean;
  /** Minimum sample so leaderboards don't reward tiny denominators. */
  minSampleKey?: keyof PlayerSeasonStat;
  minSample?: number;
}> = [
  { category: "passing",      statName: "Most Pass Attempts",   key: "passAttempts" },
  { category: "passing",      statName: "Most Completions",     key: "completions" },
  { category: "passing",      statName: "Highest Completion %", key: "completionPct", unit: "%", minSampleKey: "passAttempts", minSample: 50 },
  { category: "passing",      statName: "Most Passing Yards",   key: "passYards", unit: "yds" },
  { category: "passing",      statName: "Highest Yards/Att",    key: "passYdsPerAtt", minSampleKey: "passAttempts", minSample: 50 },
  { category: "passing",      statName: "Most Passing TDs",     key: "passTDs", unit: "TDs" },
  { category: "passing",      statName: "Fewest Interceptions", key: "interceptions", ascending: true, minSampleKey: "passAttempts", minSample: 100 },
  { category: "passing",      statName: "Highest QB Rating",    key: "qbRating", minSampleKey: "passAttempts", minSample: 50 },

  { category: "receiving",    statName: "Most Receptions",      key: "receptions" },
  { category: "receiving",    statName: "Most Receiving Yards", key: "recYards", unit: "yds" },
  { category: "receiving",    statName: "Highest Yards/Catch",  key: "recYdsPerCatch", minSampleKey: "receptions", minSample: 10 },
  { category: "receiving",    statName: "Most Receiving TDs",   key: "recTDs", unit: "TDs" },

  { category: "rushing",      statName: "Most Rush Attempts",   key: "rushAttempts" },
  { category: "rushing",      statName: "Most Rushing Yards",   key: "rushYards", unit: "yds" },
  { category: "rushing",      statName: "Highest Yards/Rush",   key: "rushYdsPerAtt", minSampleKey: "rushAttempts", minSample: 50 },
  { category: "rushing",      statName: "Most Rushing TDs",     key: "rushTDs", unit: "TDs" },

  { category: "special-teams", statName: "Most Punt Returns",        key: "puntReturns" },
  { category: "special-teams", statName: "Most Punt Return Yards",   key: "puntRetYards", unit: "yds" },
  { category: "special-teams", statName: "Highest Punt Return Avg",  key: "puntRetAvg", minSampleKey: "puntReturns", minSample: 5 },
  { category: "special-teams", statName: "Most Punt Return TDs",     key: "puntRetTDs", unit: "TDs" },
  { category: "special-teams", statName: "Most Kick Returns",        key: "kickReturns" },
  { category: "special-teams", statName: "Most Kick Return Yards",   key: "kickRetYards", unit: "yds" },
  { category: "special-teams", statName: "Highest Kick Return Avg",  key: "kickRetAvg", minSampleKey: "kickReturns", minSample: 5 },
  { category: "special-teams", statName: "Most Kick Return TDs",     key: "kickRetTDs", unit: "TDs" },
  { category: "special-teams", statName: "Most Punts",               key: "punts" },
  { category: "special-teams", statName: "Most Punt Yards",          key: "puntYards", unit: "yds" },
  { category: "special-teams", statName: "Highest Punt Avg",         key: "puntAvg", minSampleKey: "punts", minSample: 3 },

  { category: "defense", statName: "Most Sacks",         key: "sacks" },
  { category: "defense", statName: "Most Interceptions", key: "defInterceptions" },
];

/**
 * Per-hero blurb. Returns the hand-written `user.bio` when present, otherwise
 * synthesizes one sentence from the hero's records, championships, SB
 * appearances, awards, and most-played team.
 */
export function bioForUser(userId: string): string | null {
  const user = userById.get(userId);
  if (!user) return null;
  if (user.bio) return user.bio;

  const champs = championshipsForUser(userId).length;
  const apps = sbAppearancesForUser(userId).length;
  const records = recordsForUser(userId).filter(isStatRecord).length;
  const awards = awardsForUser(userId).length;
  const mostTeam = mostPlayedTeamForUser(userId);
  const teamLabel = mostTeam
    ? teamByAbbr.get(mostTeam.team)?.displayName ?? mostTeam.team
    : null;

  const parts: string[] = [];
  if (teamLabel && mostTeam) {
    parts.push(
      `${teamLabel} regular${mostTeam.seasons > 1 ? ` over ${mostTeam.seasons} seasons` : ""} (${mostTeam.w}-${mostTeam.l}${mostTeam.t ? `-${mostTeam.t}` : ""})`,
    );
  }
  if (champs > 0) {
    parts.push(`${champs} Super Bowl${champs === 1 ? "" : "s"}`);
  } else if (apps > 0) {
    parts.push(`${apps} Super Bowl appearance${apps === 1 ? "" : "s"}`);
  }
  if (records > 0) {
    parts.push(`${records} league record${records === 1 ? "" : "s"}`);
  }
  if (awards > 0) {
    parts.push(`${awards} season award${awards === 1 ? "" : "s"}`);
  }

  if (parts.length === 0) return null;
  return parts.join(" · ") + ".";
}

/**
 * Heroes who have controlled this in-game player at least once, with the
 * number of seasons they did so.
 */
export function heroesForPlayer(playerId: string): { user: User; seasons: number }[] {
  const counts = new Map<string, number>();
  for (const s of playerStatsForPlayer(playerId)) {
    counts.set(s.userId, (counts.get(s.userId) ?? 0) + 1);
  }
  // Also fold in users credited on records (covers players the spreadsheet
  // booked a feat for outside the per-season stat sheets).
  for (const r of recordsForPlayer(playerId)) {
    for (const uid of r.userIds) {
      if (!counts.has(uid)) counts.set(uid, 0);
    }
  }
  return [...counts.entries()]
    .map(([uid, seasons]) => ({ user: userById.get(uid)!, seasons }))
    .filter((x) => Boolean(x.user))
    .sort((a, b) => b.seasons - a.seasons || a.user.displayName.localeCompare(b.user.displayName));
}

/** Auto-generated one-liner for an in-game player based on their statlines. */
export function bioForPlayer(playerId: string): string | null {
  const player = playerById.get(playerId);
  if (!player) return null;
  if (player.bio) return player.bio;

  const lines = playerStatsForPlayer(playerId);
  const recs = recordsForPlayer(playerId).filter(isStatRecord);
  const heroes = heroesForPlayer(playerId);

  const seasons = new Set(lines.map((l) => l.seasonId)).size;

  // Headline stat for skill positions.
  let headline: string | null = null;
  const totalRushYds = sum(lines, "rushYards");
  const totalRushTDs = sum(lines, "rushTDs");
  const totalRecYds = sum(lines, "recYards");
  const totalRecTDs = sum(lines, "recTDs");
  const totalPassYds = sum(lines, "passYards");
  const totalPassTDs = sum(lines, "passTDs");
  const totalSacks = sum(lines, "sacks");
  const totalInts = sum(lines, "defInterceptions");

  if (totalPassYds > 0) {
    headline = `${totalPassYds.toLocaleString()} pass yds, ${totalPassTDs} TD across ${seasons} season${seasons === 1 ? "" : "s"}`;
  } else if (totalRushYds > 0) {
    headline = `${totalRushYds.toLocaleString()} rush yds, ${totalRushTDs} TD across ${seasons} season${seasons === 1 ? "" : "s"}`;
  } else if (totalRecYds > 0) {
    headline = `${totalRecYds.toLocaleString()} rec yds, ${totalRecTDs} TD across ${seasons} season${seasons === 1 ? "" : "s"}`;
  } else if (totalSacks > 0 || totalInts > 0) {
    const bits: string[] = [];
    if (totalSacks > 0) bits.push(`${totalSacks} sacks`);
    if (totalInts > 0) bits.push(`${totalInts} INTs`);
    headline = `${bits.join(", ")} across ${seasons} season${seasons === 1 ? "" : "s"}`;
  }

  const parts: string[] = [];
  if (headline) parts.push(headline);
  if (recs.length > 0) {
    parts.push(`${recs.length} league record${recs.length === 1 ? "" : "s"}`);
  }
  if (heroes.length > 0) {
    parts.push(
      `Played by ${heroes
        .slice(0, 3)
        .map((h) => h.user.shortName ?? h.user.displayName)
        .join(", ")}${heroes.length > 3 ? "…" : ""}`,
    );
  }
  if (parts.length === 0) return null;
  return parts.join(" · ") + ".";
}

function sum(lines: PlayerSeasonStat[], key: keyof PlayerSeasonStat): number {
  let total = 0;
  for (const l of lines) {
    const v = l[key];
    if (typeof v === "number") total += v;
  }
  return total;
}

export function personalBestsForPlayer(playerId: string): CategoryPersonalBest[] {
  const lines = playerStatsForPlayer(playerId);
  const out: CategoryPersonalBest[] = [];
  for (const def of STAT_DEFS) {
    let best: { row: PlayerSeasonStat; value: number } | null = null;
    for (const row of lines) {
      const raw = row[def.key];
      if (typeof raw !== "number") continue;
      if (def.minSampleKey && def.minSample != null) {
        const sample = row[def.minSampleKey];
        if (typeof sample !== "number" || sample < def.minSample) continue;
      }
      if (!best) {
        best = { row, value: raw };
      } else if (def.ascending ? raw < best.value : raw > best.value) {
        best = { row, value: raw };
      }
    }
    if (best) {
      out.push({
        category: def.category,
        statName: def.statName,
        value: best.value,
        unit: def.unit,
        seasonId: best.row.seasonId,
        year: best.row.year,
        team: best.row.team,
      });
    }
  }
  return out;
}
