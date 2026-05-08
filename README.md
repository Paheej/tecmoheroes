# Tecmo Heroes

An archive of incredible **Tecmo Super Bowl** records and feats. Rebuilt in the spirit of [tecmogeek.com](https://tecmogeek.com), seeded from records originally archived at [tecmoheroes.com](https://tecmoheroes.com). Every record links the in-game **Tecmo profile card** (8-bit) to the **real NFL face** that lent the legend.

- **Stack:** Next.js 15 App Router · React 19 · TypeScript · Tailwind v4
- **Hosting model:** `output: "export"` — static HTML/CSS/JS. No server, no database, no runtime dependencies.
- **Source of truth:** the spreadsheet at `data/Tecmo Statistics Current.xlsx`. JSON under `data/` is regenerated from it.

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [First-time deployment, end to end](#2-first-time-deployment-end-to-end)
3. [Rebuilding the site after a new season](#3-rebuilding-the-site-after-a-new-season)
4. [Adding a single record without a full rebuild](#4-adding-a-single-record-without-a-full-rebuild)
5. [Project layout](#5-project-layout)
6. [Data model in one screen](#6-data-model-in-one-screen)
7. [Stat maximums](#7-stat-maximums)
8. [Sprites and headshots](#8-sprites-and-headshots)
9. [Why JSON instead of a real database](#9-why-json-instead-of-a-real-database)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

Install once on the machine that will be doing the rebuilds and deploys.

| Tool | Version | Why |
|---|---|---|
| **Node.js** | 18.18+ (20 LTS recommended) | Next 15 needs it |
| **npm** | bundled with Node | dependency install |
| **Python** | 3.10+ | runs `scripts/convert-xlsx.py` |
| **openpyxl** | 3.1+ | the xlsx parser |
| **Git** | any recent | source control |

```bash
# macOS (Homebrew)
brew install node python git
python3 -m pip install --user openpyxl

# verify
node --version
python3 -c "import openpyxl; print(openpyxl.__version__)"
```

---

## 2. First-time deployment, end to end

This is the path from a fresh clone to a live site. Do every step in order the first time. Copy/paste the commands.

### 2.1 Clone and install

```bash
git clone <your-fork-or-this-repo-url> tecmoheroes
cd tecmoheroes
npm install
```

`npm install` reads `package.json` / `package-lock.json` and pulls Next.js, React, Tailwind, and `tsx` into `node_modules/`. There are no native dependencies, so this is just a download.

### 2.2 Drop in the spreadsheet

Place the master workbook at:

```
data/Tecmo Statistics Current.xlsx
```

That filename is hard-coded in `scripts/convert-xlsx.py`. Do not rename it. The workbook is the single source of truth for players, users, teams, seasons, team-seasons, per-player statlines, awards, and championships.

### 2.3 Generate the JSON

```bash
python3 scripts/convert-xlsx.py
```

This rewrites every JSON file under `data/`:

```
data/categories.json
data/players.json
data/users.json
data/teams.json
data/seasons.json
data/team-seasons.json
data/player-stats.json
data/records.json
```

The script is idempotent — run it again whenever the spreadsheet changes. It will print a short summary of what it wrote.

### 2.4 Smoke-test locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click into a category, a hero, and a player. Confirm the helmets render and that the home page lists the latest Super Bowl. If anything looks empty, the spreadsheet probably did not contain a value for that field — fix it in the workbook and re-run step 2.3.

```bash
npm run typecheck   # optional sanity check
```

### 2.5 Build the static export

```bash
npm run build
```

When this finishes you have a fully static site under `./out/`:

```
out/
├── index.html
├── heroes/<slug>/index.html
├── players/<slug>/index.html
├── records/<category>/index.html
├── seasons/<id>/index.html
├── rules/index.html
├── about/index.html
└── _next/...   # JS/CSS chunks, images, sprites
```

Every page in the app is pre-rendered at build time. There is no Node server in the output.

### 2.6 Deploy `out/`

Upload `out/` to any static host. Pick one:

- **Netlify drag-and-drop:** drop the `out/` folder onto [app.netlify.com/drop](https://app.netlify.com/drop) and you have a URL in seconds.
- **Vercel:** `npx vercel --prod` from the project root will detect Next.js and host it.
- **GitHub Pages:** push `out/` to the `gh-pages` branch (or use the `actions/deploy-pages` workflow).
- **S3 / CloudFront:** `aws s3 sync out/ s3://your-bucket --delete` and point CloudFront at the bucket.
- **A literal Apache box:** `rsync -avz --delete out/ user@host:/var/www/tecmoheroes/`.

The site has no API calls, so any of these works equivalently. **Do not** deploy the project root — only the `out/` directory.

### 2.7 Wire up the domain (optional)

Point your DNS at the chosen host. There is nothing site-side to configure — `next.config.mjs` already sets `output: "export"`, `trailingSlash: true`, and `images.unoptimized = true` so links keep working under any prefix.

---

## 3. Rebuilding the site after a new season

This is the path you will take every time fresh stats land in the spreadsheet. Treat the steps below as a checklist; it should take five minutes from edit to deploy.

### 3.1 Update the workbook

Edit `data/Tecmo Statistics Current.xlsx` directly:

- Add the new season row (id, year, champion, runner-up, AFC/NFC reps, scores).
- Add the new team-season rows (one per starter on each team that played).
- Add the per-player statline rows for the season.
- Add any new award rows (MVP / OPOY / DPOY).
- If a brand-new hero played for the first time, add their row in the users/heroes sheet.

Do not edit the JSON files by hand — they are overwritten on the next conversion.

### 3.2 Regenerate the JSON

```bash
python3 scripts/convert-xlsx.py
```

This is the only command that should ever modify the JSON files in `data/` (other than `npm run ingest`). Re-running it after every spreadsheet edit is the safe default.

### 3.3 Inspect the diff

```bash
git status
git diff data/
```

Skim the diff. You should see new entries appended to the season-aware files (`seasons.json`, `team-seasons.json`, `player-stats.json`, `records.json`) and possibly a new entry in `users.json` or `players.json` if a new face joined.

### 3.4 Local verification

```bash
npm run dev
```

Spot-check:

- `/seasons/<new-id>` shows the new Super Bowl banner.
- `/heroes/<slug>` for each participant shows the new season-by-season row and the personal-best card under the profile.
- `/players/<slug>` shows the new statline row in season-by-season and updates personal best by category.
- `/` shows the new Super Bowl as "Most Recent."

If a record changed hands, the relevant `/records/<category>` page should reflect the new leader and the previous leader should drop a row.

```bash
npm run typecheck
```

### 3.5 Static build

```bash
npm run build
```

`out/` is rewritten in place. The build is fully deterministic — given the same JSON it always produces the same output.

### 3.6 Commit

```bash
git add data/ public/ app/
git commit -m "Season <id>: add <season-summary>"
git push
```

Commit the regenerated JSON. The diff is part of the archive — that is the whole point of using JSON instead of a database.

### 3.7 Re-deploy `out/`

Same as step 2.6. If your host has a CI hook (Netlify / Vercel / GitHub Pages), the push in 3.6 may have already done it; otherwise re-run the upload command.

---

## 4. Adding a single record without a full rebuild

Sometimes a record needs to land out-of-band — a one-off correction, a missed feat from an earlier season. The interactive ingest CLI is for this case:

```bash
npm run ingest
```

It walks you through category, scope, stat name, value, players, users, teams, season, date, and notes. It validates every foreign key against the existing JSON, warns when a single-season value exceeds Tecmo's hard caps, and appends to `data/records.json`.

Non-interactive forms:

```bash
# Single record from a JSON string
npm run ingest -- --json '{"category":"passing","scope":"season","statName":"Most Passing Yards","value":7484,"unit":"yds","tecmoPlayerIds":["moon"],"userIds":["WB"],"teamAbbrs":["HOU"]}'

# Bulk from a file containing a JSON array of records
npm run ingest -- --file ./incoming.json
```

Then rebuild:

```bash
npm run build
# or in one shot:
npm run ingest:rebuild
```

Caveat: a record added through `npm run ingest` will be **overwritten the next time** `python3 scripts/convert-xlsx.py` runs, unless you also added the equivalent row to the spreadsheet. Treat the CLI as an emergency lane, not the primary way records get in.

---

## 5. Project layout

```
app/                          Next.js App Router
├── page.tsx                  Home: categories, latest SB, featured records
├── layout.tsx                Root shell, footer
├── about/                    Story, stats methodology, record format
├── rules/                    Weekend rules, draft methods, tier list
├── heroes/                   Human league members (index + detail)
├── players/                  In-game characters (index + detail)
├── records/[category]/       Per-category record tables
└── seasons/[id]/             Per-season recaps + stats

components/                   Shared UI
├── NavBar.tsx
├── TecmoProfileCard.tsx      8-bit profile card
├── RecordCard.tsx            Single-record tile
├── RecordRow.tsx             Single-record table row
├── SuperBowlPanel.tsx        Champion / runner-up display
├── FeaturedRandomRecords.tsx Home-page record shuffler
└── Sprites.tsx               <Helmet/> and <Headshot/> sprite slicers

lib/
├── data.ts                   JSON loaders + every derived helper
├── types.ts                  Shared TS types + STAT_MAX
└── format.ts                 Value/scope formatting helpers

data/                         Source of truth (XLSX) + generated JSON
public/sprites/               Tecmo helmet + headshot sprite sheets
scripts/
├── convert-xlsx.py           XLSX → JSON regeneration
└── ingest.ts                 Interactive single-record CLI
```

Pages and routes:

- `/` — featured records + category index + most recent Super Bowl
- `/records/[category]` — full table for a record category
- `/players` and `/players/[slug]` — Tecmo profile + real NFL avatar + records held + season-by-season + personal best by category
- `/heroes` and `/heroes/[slug]` — human league members, championships, SB appearances, awards, records, most-played team card, personal best by category
- `/seasons` and `/seasons/[id]` — records by season
- `/rules` — weekend format, draft methods, tier list, etc.
- `/about` — record format, stats methodology, story

When you add or edit anything in `data/`, **every related page rebuilds automatically** on the next `next build`.

---

## 6. Data model in one screen

```ts
Record {
  id, category, scope,                       // routing keys
  statName, value, unit,                     // what
  tecmoPlayerIds[], userIds[], teamAbbrs[],  // who (joins)
  seasonId, dateAchieved,                    // when
  asterisk, notes                            // caveats
}
```

A single record can reference multiple players (ties), multiple users, multiple teams. Each id is a foreign key into the respective JSON file. See `lib/types.ts` for the full set of shapes (`User`, `TecmoPlayer`, `Team`, `Season`, `TeamSeason`, `PlayerSeasonStat`).

---

## 7. Stat maximums

Tecmo Super Bowl caps single-season totals. Records that exceed a cap are derived (game-by-game running totals; or summing receiver yards minus the backup QB's contribution).

| Stat | Max |
|---|---|
| Passing yards | 6,200 |
| Rushing / Receiving / Return yards | 4,095 |
| Passing / Rushing / Receiving TDs | 63 |
| Rush Attempts (single season) | 255 |

`lib/types.ts` exports these as `STAT_MAX`. The ingest CLI prints a warning when a season value exceeds the cap so you remember to document the derivation in `notes`.

---

## 8. Sprites and headshots

The `TecmoProfileCard` and `<Helmet/>` components render real images when the file exists, and a styled placeholder otherwise. Drop assets into:

```
public/sprites/helmets.png             # 28-team helmet strip (NES sized)
public/sprites/teams/<team-slug>.png   # per-team 30-slot headshot strip
public/avatars/<avatarSlug>.png        # real-NFL headshot, square
```

Slugs are read from each player's `teamSlug` / `spriteIndex` fields in `data/players.json`. Recommended sizes:

- Helmet strip: 28 helmets × 22px (≈ 644×22 pixel sheet, or any consistent multiple)
- Headshot strip: 30 slots × 32px per team
- Avatar: 256×256 square, will be cropped to a circle

No build step is needed for new images — `next build` picks them up automatically.

---

## 9. Why JSON instead of a real database

Two reasons that matter for an archive like this:

1. **The whole site is reviewable in git.** Every record edit is a diff. No drift between a production DB and seed data.
2. **Static export means free, indestructible hosting.** `npm run build` → upload `out/`. No server to keep alive, no DB to migrate, no surprise bills.

If/when this grows beyond a single archivist, swap `lib/data.ts` to read from Postgres or SQLite — the rest of the codebase doesn't change.

---

## 10. Troubleshooting

**`python3 scripts/convert-xlsx.py` errors with `ModuleNotFoundError: openpyxl`**
Run `python3 -m pip install --user openpyxl` (or `pip3 install openpyxl`).

**`npm install` warns about peer deps**
Safe to ignore for React 19 / Next 15 — the project pins exact versions in `package.json`.

**`npm run build` complains about a missing helmet sprite**
A new team abbreviation in the spreadsheet does not have a slug in `components/Sprites.tsx`. Add it to the `ABBR_TO_SLUG` map and drop a helmet into the strip.

**Pages are blank after a rebuild**
Confirm `data/*.json` actually changed. `git diff data/` is the fastest check. If the JSON looks right and the pages still look wrong, delete `.next/` and `out/` and re-run `npm run build`.

**A record is missing on `/heroes/<slug>` but shows on `/players/<slug>`**
The record references a `tecmoPlayerId` but is missing the corresponding `userId`. Add the user id in the spreadsheet and re-run the conversion.

**Helmet renders as plain text instead of a sprite**
That team abbreviation is not in `ABBR_TO_SLUG` (see `components/Sprites.tsx`). The fallback is to render the abbr as text — fix it by adding the mapping.

---

> Really — are we copywriting stuff for a game made in 1991? Feel free to use what you want from this site, man. Spread the book of Big Red and the Tecmo gospel.
