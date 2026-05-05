# Tecmo Heroes

An archive of incredible **Tecmo Super Bowl** records and feats. Built in the spirit of [tecmogeek.com](https://tecmogeek.com), seeded from the records archived at [tecmoheroes.com](https://tecmoheroes.com).

Every record links the in-game **Tecmo profile card** (8-bit) to the **real NFL face** that lent the legend.

## Stack

- Next.js 15 App Router · React 19 · TypeScript · Tailwind v4
- `output: "export"` — fully static. Deploys anywhere that serves files.
- Data lives as JSON in `data/`. No database server.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # writes ./out
npm run typecheck
```

## How it works

The site is generated from five JSON files:

```
data/categories.json   passing | rushing | receiving | defense | special-teams | team
data/teams.json        Tecmo team abbrs (Hou, Phi, Det, Rai, ...)
data/players.json      In-game players (Moon, Jackson, Sanders) → real NFL names
data/users.json        Human league members (Drew, Don, Cam, Major, ...)
data/seasons.json      Sequential league seasons
data/records.json      The records themselves
```

Pages and routes:

- `/` — featured records + category index
- `/records/[category]` — full table for a category
- `/players` and `/players/[slug]` — Tecmo profile + real NFL avatar + records held
- `/users` and `/users/[slug]` — human league members
- `/seasons` and `/seasons/[id]` — records by season
- `/about` — record format and stat-max methodology

When you add or edit anything in `data/`, **every related page rebuilds automatically** on the next `next build`. That's the "database that auto-updates pages" model — JSON is the database, the rebuild is the update.

## Adding a record

Interactive (recommended):

```bash
npm run ingest
```

You'll be prompted for category, scope, stat name, value, players, users, teams, season, date, and notes. The CLI:

- Validates all foreign keys against `data/{players,users,teams}.json`
- Warns when a season-stat value exceeds Tecmo's hard caps (6200 pass yds, 4095 rush/rec yds, 63 TDs, 255 rush att)
- Auto-derives a record id and appends to `data/records.json`

Then rebuild to update the site:

```bash
npm run build
# or in one shot:
npm run ingest:rebuild
```

Non-interactive forms:

```bash
# Single record from JSON string
npm run ingest -- --json '{"category":"passing","scope":"season","statName":"Most Passing Yards","value":7484,"unit":"yds","tecmoPlayerIds":["moon"],"userIds":["drew"],"teamAbbrs":["Hou"]}'

# Bulk from a file containing a JSON array of records
npm run ingest -- --file ./incoming.json
```

## Adding a player or user

Edit `data/players.json` or `data/users.json` directly. Required fields are listed in `lib/types.ts`. The ingest CLI rejects records that reference unknown ids, so add the player first.

## Asset conventions (sprites + headshots)

The `TecmoProfileCard` and `PlayerAvatar` components render real images when the file exists, and a styled placeholder otherwise. Drop assets into:

```
public/sprites/{spriteSlug}.png        # 8-bit Tecmo sprite, transparent background
public/avatars/{avatarSlug}.png        # Real NFL headshot, square
```

Slugs are read from each player's `spriteSlug` / `avatarSlug` fields in `data/players.json`. Recommended sizes:

- Sprite: 56×56 to 96×96, transparent PNG, `image-rendering: pixelated` is set
- Avatar: 256×256 square, will be cropped to a circle

No build step is needed for new images — `next build` picks them up automatically.

## Data model in one screen

```ts
Record {
  id, category, scope,            // routing keys
  statName, value, unit,          // what
  tecmoPlayerIds[], userIds[], teamAbbrs[],  // who (joins)
  seasonId, dateAchieved,         // when
  asterisk, notes                 // caveats
}
```

A single record can reference multiple players (ties), multiple users, multiple teams. Each id is a foreign key into the respective JSON file.

## Stat maximums

Tecmo Super Bowl caps single-season totals. Records that exceed a cap are derived (game-by-game running totals; or summing receiver yards minus the backup QB's contribution). Values:

| Stat | Max |
|---|---|
| Passing yards | 6,200 |
| Rushing / Receiving / Return yards | 4,095 |
| Passing / Rushing / Receiving TDs | 63 |
| Rush Attempts (single season) | 255 |

`lib/types.ts` exports these as `STAT_MAX`. The ingest CLI prints a warning when a season value exceeds the cap so you remember to document the derivation in `notes`.

## Why JSON instead of a real database?

Two reasons that matter for this kind of archive:

1. **The whole site is reviewable in git.** Every record edit is a diff. No drift between prod DB and seed data.
2. **Static export means free, indestructible hosting.** `npm run build` → upload `out/`. No server to keep alive.

If/when this grows beyond a single archivist, swap `lib/data.ts` to read from Postgres or SQLite — the rest of the codebase doesn't change.

---

> Really are we copywriting stuff for a game made in 1991? Feel free to use what you want from this site man — spread the book of Big Red and the Tecmo gospel.
