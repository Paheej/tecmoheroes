import categoriesJson from "@/data/categories.json";
import recordsJson from "@/data/records.json";
import playersJson from "@/data/players.json";
import usersJson from "@/data/users.json";
import teamsJson from "@/data/teams.json";
import seasonsJson from "@/data/seasons.json";
import type {
  CategoryId,
  CategoryMeta,
  Record,
  TecmoPlayer,
  User,
  Team,
  Season,
} from "./types";

export const categories = categoriesJson as CategoryMeta[];
export const records = recordsJson as Record[];
export const players = playersJson as TecmoPlayer[];
export const users = usersJson as User[];
export const teams = teamsJson as Team[];
export const seasons = seasonsJson as Season[];

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
