# Season 21 — preview test script

Click-through checklist for the Vercel preview on `data/season-21`.
Replace `<PREVIEW>` with the preview URL. Should take about five minutes.

Everything below was verified locally against `npm run build`; this sheet is to
confirm the same thing survived the deploy.

---

## 1. Home — `<PREVIEW>/`

- [ ] **"Most Recent Super Bowl"** panel reads **Super Bowl 21**
- [ ] Champion **Denver**, played by **PJ Street**, score **20**
- [ ] Runner-up **San Francisco**, played by **Computer**, score **10**
- [ ] Location line reads **PJ's Basement**
- [ ] Both helmets render as sprites, not plain text
- [ ] "Featured Records" tiles load (they reshuffle per visit — just confirm six appear)

## 2. Season 21 — `<PREVIEW>/seasons/21/`

This is the main new page.

- [ ] Header reads **Season 21 · 2026**
- [ ] Super Bowl panel: **DEN 20 — SF 10**, AFC `DEN`, NFC `SF`
- [ ] **Single-season records (2)**:
  - [ ] *Highest Punt Return Avg* — **19.3** — Winder (Sammy Winder), Hero **PJ**, Team **DEN**
  - [ ] *Most Kick Returns* — **64** — Jackson, Hero **AD**, Team **PHI**
- [ ] **Awards** — all three present:
  - [ ] MVP **Randall Cunningham** (PHI · AD)
  - [ ] OPOY **Bobby Humphrey** (DEN · PJ)
  - [ ] DPOY **Dave Waymer** (SF · COMP)
- [ ] **Heroes this season (2)** table shows **both** rows:

  | Hero | Team | W | L | T | PF | PA |
  |---|---|---|---|---|---|---|
  | PJ | DEN | 16 | 0 | 0 | 644 | 198 |
  | AD | PHI | 11 | 5 | 0 | 413 | 325 |

> ⚠️ **The PHI row is the important one.** It was mis-tagged to Season 20 in the
> spreadsheet and is the whole reason for the workbook fix in this PR. If PHI is
> missing here, the fix did not deploy.

## 3. Season 20 regression — `<PREVIEW>/seasons/20/`

Season 20 must be **unchanged** from production.

- [ ] Header reads **Season 20 · 2025** — **not 2026**
- [ ] Super Bowl panel: **DET 44 — HOU 13**
- [ ] "Heroes this season" lists exactly **two** rows: **PJ / DET 15-1** and **AD / NO 9-7**
- [ ] **No PHI row appears** (PHI never played season 20)

## 4. Seasons index — `<PREVIEW>/seasons/`

- [ ] **21 seasons** listed, 1 through 21
- [ ] Season 21 present and links through
- [ ] Season 21 shows champion **DEN**

## 5. Heroes

### PJ — `<PREVIEW>/heroes/pj/`
- [ ] Season-by-season table has a **Season 21 · DEN · 16-0** row
- [ ] Super Bowl / championship count incremented by one vs production
- [ ] Holds the new **Highest Punt Return Avg** record (19.3)

### AD — `<PREVIEW>/heroes/ad/`
- [ ] Bio renders: *"Picture Jesus in a flannel…"* — **must not be blank**
- [ ] Season-by-season shows **Season 21 · PHI · 11-5**
- [ ] Awards list includes **Season 21 MVP** (Randall Cunningham)
- [ ] "Most-Played Team" card shows **PHI**

### Bio spot-check — bios were being silently wiped before this PR
Each of these must show a non-empty bio paragraph:

- [ ] `<PREVIEW>/heroes/bf/` — circus / tattoos / corgi
- [ ] `<PREVIEW>/heroes/cj/` — record chaser, "the Stomp"
- [ ] `<PREVIEW>/heroes/cr/` — all-American American
- [ ] `<PREVIEW>/heroes/mae/` — Andre Reed superfan
- [ ] `<PREVIEW>/heroes/td/` — Halo career

## 6. New players

New Denver pages (all should show a **headshot sprite**, not a placeholder box):

- [ ] `<PREVIEW>/players/winder-den/` — Sammy Winder, holds Highest Punt Return Avg **19.3**
- [ ] `<PREVIEW>/players/humphrey-den/` — Bobby Humphrey, Season 21 OPOY
- [ ] `<PREVIEW>/players/mecklenburg-den/` — Karl Mecklenburg
- [ ] `<PREVIEW>/players/treadwell-den/` — David Treadwell

New Philadelphia pages:

- [ ] `<PREVIEW>/players/joyner-phi/` — Seth Joyner
- [ ] `<PREVIEW>/players/simmons-phi/` — Clyde Simmons
- [ ] `<PREVIEW>/players/hopkins-phi/` — Wes Hopkins

- [ ] `<PREVIEW>/players/` index loads and includes the new DEN/PHI names

## 7. Records pages

### `<PREVIEW>/records/defense-special-teams/`
- [ ] *Highest Punt Return Avg* leader is **Winder 19.3** (DEN, PJ, season 21)
- [ ] Meggett's **15.6** is no longer the leader
- [ ] *Most Kick Returns* leader is **Jackson 64** (PHI, AD, season 21)
- [ ] Smith/BUF **62** is no longer the leader

### `<PREVIEW>/records/team/`
- [ ] **Super Bowl 21 Champion — DEN** entry present
- [ ] **Season 21 MVP / OPOY / DPOY** entries present

### `<PREVIEW>/records/offense/`
- [ ] Page loads, existing passing/rushing/receiving leaders unchanged

## 8. Sprite regression sweep

Sprite indexes come from roster data at a `/tmp` path that can vanish — if it was
missing during a rebuild, headshots silently go wrong site-wide. Quick sanity check
on players **not** touched by this PR:

- [ ] `<PREVIEW>/players/tuggle-atl/` — Jessie Tuggle, correct headshot
- [ ] `<PREVIEW>/players/sanders-atl/` — Deion Sanders, correct headshot
- [ ] `<PREVIEW>/players/moon-hou/` — Warren Moon, correct headshot

If these look wrong, the roster data was missing at build time — see the
"Roster data" section in `README.md`.

## 9. Known cosmetic issues (expected — do not file)

- [ ] Season 21 *Most Kick Returns* shows **"Keith Jackson"**; the spreadsheet says
      **Kenny Jackson**. Pre-existing: the converter keys players by last name + team,
      so both Jacksons on PHI share `jackson-phi`. Tracked in the PR description.
- [ ] Super Bowl 21 note reads *"SF (COMP) **Elimanted** PHI (AD) 24-21 in the NFCCG."*
      Typo is in the spreadsheet, carried through verbatim. Fix it in the workbook and
      re-run `python3 scripts/convert-xlsx.py` if you want it corrected.

---

## Rebuilding locally

```bash
# roster data must exist first — it lives in /tmp and vanishes on reboot
ls /tmp/tecmogeek/data | wc -l    # expect 41

python3 scripts/convert-xlsx.py    # expect: 21 seasons, 275 players, 84 records,
                                   #         72 team-seasons, 639 statlines
npm run typecheck
npm run build
```
