#!/usr/bin/env tsx
/**
 * Interactive CLI for adding a record to data/records.json.
 *
 * Usage:
 *   npm run ingest             # interactive prompts
 *   npm run ingest:rebuild     # ingest then `next build`
 *
 * Non-interactive (single record):
 *   npm run ingest -- --json '{"category":"passing", ...}'
 *
 * Bulk from a CSV/JSON file:
 *   npm run ingest -- --file path/to/records.json
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

type CategoryId = "passing" | "rushing" | "receiving" | "defense" | "special-teams" | "team";
type Scope = "single-play" | "single-game" | "season" | "career" | "playoff" | "super-bowl";

interface RecordInput {
  id?: string;
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

const ROOT = process.cwd();
const RECORDS_PATH = path.join(ROOT, "data", "records.json");
const PLAYERS_PATH = path.join(ROOT, "data", "players.json");
const USERS_PATH = path.join(ROOT, "data", "users.json");
const TEAMS_PATH = path.join(ROOT, "data", "teams.json");

const STAT_MAX = {
  passingYardsSeason: 6200,
  rushingYardsSeason: 4095,
  receivingYardsSeason: 4095,
  passingTDsSeason: 63,
  rushingTDsSeason: 63,
  receivingTDsSeason: 63,
  rushingAttemptsSeason: 255,
};

const CATEGORIES: CategoryId[] = ["passing", "rushing", "receiving", "defense", "special-teams", "team"];
const SCOPES: Scope[] = ["single-play", "single-game", "season", "career", "playoff", "super-bowl"];

function readJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}
function writeJson(p: string, data: unknown): void {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function deriveId(rec: RecordInput): string {
  const player = rec.tecmoPlayerIds[0] ?? "team";
  const stat = slugify(rec.statName).slice(0, 24);
  const value = String(rec.value).replace(/[^a-z0-9]/gi, "").slice(0, 6).toLowerCase();
  return `${slugify(rec.category)}-${rec.scope}-${player}-${stat}-${value}`;
}

function validate(rec: RecordInput, players: { id: string }[], users: { id: string }[], teams: { abbr: string }[]): string[] {
  const errs: string[] = [];
  if (!CATEGORIES.includes(rec.category)) errs.push(`category must be one of ${CATEGORIES.join("|")}`);
  if (!SCOPES.includes(rec.scope)) errs.push(`scope must be one of ${SCOPES.join("|")}`);
  if (!rec.statName?.trim()) errs.push("statName is required");
  if (rec.value === undefined || rec.value === "" || rec.value === null) errs.push("value is required");

  const knownPlayers = new Set(players.map((p) => p.id));
  for (const id of rec.tecmoPlayerIds ?? []) {
    if (!knownPlayers.has(id)) errs.push(`unknown tecmoPlayerId: ${id} (add to data/players.json first)`);
  }
  const knownUsers = new Set(users.map((u) => u.id));
  for (const id of rec.userIds ?? []) {
    if (!knownUsers.has(id)) errs.push(`unknown userId: ${id} (add to data/users.json first)`);
  }
  const knownTeams = new Set(teams.map((t) => t.abbr));
  for (const a of rec.teamAbbrs ?? []) {
    if (!knownTeams.has(a)) errs.push(`unknown team abbr: ${a} (add to data/teams.json first)`);
  }

  // Stat-max sanity check (non-blocking — many real records exceed the cap and are derived).
  if (rec.scope === "season" && typeof rec.value === "number") {
    const flag = (label: string, max: number) => `value ${rec.value} exceeds ${label} stat max (${max}) — confirm derivation method in notes`;
    if (/passing.*yard/i.test(rec.statName) && rec.value > STAT_MAX.passingYardsSeason)
      console.warn(`! ${flag("season passing yards", STAT_MAX.passingYardsSeason)}`);
    if (/rushing.*yard/i.test(rec.statName) && rec.value > STAT_MAX.rushingYardsSeason)
      console.warn(`! ${flag("season rushing yards", STAT_MAX.rushingYardsSeason)}`);
    if (/receiving.*yard/i.test(rec.statName) && rec.value > STAT_MAX.receivingYardsSeason)
      console.warn(`! ${flag("season receiving yards", STAT_MAX.receivingYardsSeason)}`);
    if (/passing.*td/i.test(rec.statName) && rec.value > STAT_MAX.passingTDsSeason)
      console.warn(`! ${flag("season passing TDs", STAT_MAX.passingTDsSeason)}`);
    if (/rushing.*td/i.test(rec.statName) && rec.value > STAT_MAX.rushingTDsSeason)
      console.warn(`! ${flag("season rushing TDs", STAT_MAX.rushingTDsSeason)}`);
    if (/receiving.*td/i.test(rec.statName) && rec.value > STAT_MAX.receivingTDsSeason)
      console.warn(`! ${flag("season receiving TDs", STAT_MAX.receivingTDsSeason)}`);
  }

  return errs;
}

async function promptRecord(rl: readline.Interface): Promise<RecordInput> {
  const ask = async (q: string, def?: string) => {
    const a = (await rl.question(`${q}${def ? ` [${def}]` : ""}: `)).trim();
    return a || def || "";
  };
  const askList = async (q: string) => {
    const a = await ask(q + " (comma-separated)");
    return a ? a.split(",").map((x) => x.trim()).filter(Boolean) : [];
  };

  console.log(`\nCategories: ${CATEGORIES.join(", ")}`);
  const category = (await ask("Category")) as CategoryId;
  console.log(`Scopes: ${SCOPES.join(", ")}`);
  const scope = (await ask("Scope")) as Scope;
  const statName = await ask("Stat name (e.g. 'Most Passing Yards')");
  const valueRaw = await ask("Value (number or string like '63.67 (6/382)')");
  const value: number | string = /^-?\d+(\.\d+)?$/.test(valueRaw) ? Number(valueRaw) : valueRaw;
  const unit = await ask("Unit (yds, TDs, %, blank)") || undefined;
  const tecmoPlayerIds = await askList("Tecmo player ids (from data/players.json)");
  const userIds = await askList("User ids (from data/users.json)");
  const teamAbbrs = await askList("Team abbrs (from data/teams.json)");
  const seasonRaw = await ask("Season id (number, blank for none)");
  const seasonId = seasonRaw ? Number(seasonRaw) : null;
  const dateAchieved = (await ask("Date achieved (YYYY-MM-DD, blank if unknown)")) || null;
  const asteriskRaw = (await ask("Asterisk? (y/N)", "N")).toLowerCase();
  const asterisk = asteriskRaw === "y" || asteriskRaw === "yes";
  const notes = (await ask("Notes (blank for none)")) || undefined;

  const rec: RecordInput = {
    category, scope, statName, value, unit,
    tecmoPlayerIds, userIds, teamAbbrs,
    seasonId, dateAchieved, asterisk, notes,
  };
  rec.id = deriveId(rec);
  return rec;
}

function loadRefs() {
  return {
    players: readJson<{ id: string }[]>(PLAYERS_PATH),
    users: readJson<{ id: string }[]>(USERS_PATH),
    teams: readJson<{ abbr: string }[]>(TEAMS_PATH),
  };
}

function appendRecord(rec: RecordInput): void {
  const existing = readJson<RecordInput[]>(RECORDS_PATH);
  if (existing.some((r) => r.id === rec.id)) {
    console.error(`✗ A record with id "${rec.id}" already exists. Edit data/records.json directly to update it.`);
    process.exit(1);
  }
  existing.push(rec);
  writeJson(RECORDS_PATH, existing);
  console.log(`✓ Wrote record ${rec.id} (${existing.length} total).`);
}

async function main() {
  const args = process.argv.slice(2);

  // Non-interactive paths
  const fileIdx = args.indexOf("--file");
  if (fileIdx >= 0) {
    const file = args[fileIdx + 1];
    if (!file) throw new Error("--file requires a path");
    const refs = loadRefs();
    const incoming = readJson<RecordInput[]>(file);
    if (!Array.isArray(incoming)) throw new Error("--file must contain a JSON array of records");
    for (const r of incoming) {
      const errs = validate(r, refs.players, refs.users, refs.teams);
      if (errs.length) {
        console.error(`✗ ${r.id ?? r.statName}: ${errs.join("; ")}`);
        process.exit(1);
      }
      r.id ??= deriveId(r);
      appendRecord(r);
    }
    return;
  }

  const jsonIdx = args.indexOf("--json");
  if (jsonIdx >= 0) {
    const json = args[jsonIdx + 1];
    if (!json) throw new Error("--json requires a JSON string");
    const refs = loadRefs();
    const r = JSON.parse(json) as RecordInput;
    const errs = validate(r, refs.players, refs.users, refs.teams);
    if (errs.length) {
      console.error("✗", errs.join("; "));
      process.exit(1);
    }
    r.id ??= deriveId(r);
    appendRecord(r);
    return;
  }

  // Interactive
  const refs = loadRefs();
  const rl = readline.createInterface({ input: stdin, output: stdout });
  console.log("\nTECMO HEROES — record ingest\n");
  console.log(`Known players: ${refs.players.length}, users: ${refs.users.length}, teams: ${refs.teams.length}.`);
  console.log("Tip: list ids first with `cat data/players.json | jq -r '.[].id'`.\n");

  const rec = await promptRecord(rl);
  rl.close();

  const errs = validate(rec, refs.players, refs.users, refs.teams);
  if (errs.length) {
    console.error("\n✗ Validation failed:");
    for (const e of errs) console.error("  -", e);
    process.exit(1);
  }

  console.log("\nProposed record:");
  console.log(JSON.stringify(rec, null, 2));
  appendRecord(rec);

  console.log("\nNext: run `npm run build` (or `npm run ingest:rebuild` next time) to regenerate the static site.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
