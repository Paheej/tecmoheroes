#!/usr/bin/env python3
"""Convert data/Tecmo Statistics Current.xlsx into the JSON files under data/.

Re-runnable. Overwrites players.json, users.json, teams.json, seasons.json,
records.json, and categories.json from the workbook contents.

Usage: python3 scripts/convert-xlsx.py
Requires: openpyxl
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
XLSX = DATA / "Tecmo Statistics Current.xlsx"
TECMOGEEK_DATA = Path("/tmp/tecmogeek/data")  # sibling roster JSONs from ubuwaits/tecmogeek

# Tecmogeek team-slug -> our team abbr (mirror inverse below)
TEAM_ABBR_TO_SLUG = {
    "ATL": "falcons", "BUF": "bills", "CHI": "bears", "CIN": "bengals",
    "CLE": "browns", "DAL": "cowboys", "DEN": "broncos", "DET": "lions",
    "GB":  "packers", "GIA": "giants", "HOU": "oilers", "IND": "colts",
    "JET": "jets", "KC":  "chiefs", "MIA": "dolphins", "MIN": "vikings",
    "NE":  "patriots", "NO":  "saints", "PHI": "eagles", "PHX": "cardinals",
    "PIT": "steelers", "RAI": "raiders", "RAM": "rams", "SD":  "chargers",
    "SEA": "seahawks", "SF":  "49ers", "TB":  "buccaneers", "WAS": "redskins",
}

# Tecmogeek HEADSHOT_POSITIONS index -> sprite slot
HEADSHOT_POSITIONS = [
    "QB1", "QB2", "RB1", "RB2", "RB3", "RB4", "WR1", "WR2", "WR3", "WR4",
    "TE1", "TE2", "C", "LG", "RG", "LT", "RT", "RE", "NT", "LE",
    "ROLB", "RILB", "LILB", "LOLB", "RCB", "LCB", "FS", "SS", "K", "P",
]

# Fallback sprite slot when we cannot match a player by name
POS_DEFAULT_SLOT = {
    "QB": 0, "RB": 2, "WR": 6, "TE": 10, "K": 28, "P": 29,
    "DL": 19, "DT": 18, "DE": 17, "LB": 23,
    "DB": 24, "CB": 25, "S": 26, "KR": 2, "PR": 2,
}


# ---------------------------------------------------------------------------
# Normalization tables
# ---------------------------------------------------------------------------

# xlsx team code -> normalized abbr we use everywhere
TEAM_ALIASES = {
    "OAK": "RAI",   # used once for Raiders
    "DET*": "DET",
    "RAMS": "RAM",
}

NFL_TEAMS = {
    "ATL": ("Atlanta", "Atlanta Falcons", "NFC", "West"),
    "BUF": ("Buffalo", "Buffalo Bills", "AFC", "East"),
    "CHI": ("Chicago", "Chicago Bears", "NFC", "Central"),
    "CIN": ("Cincinnati", "Cincinnati Bengals", "AFC", "Central"),
    "CLE": ("Cleveland", "Cleveland Browns", "AFC", "Central"),
    "DAL": ("Dallas", "Dallas Cowboys", "NFC", "East"),
    "DEN": ("Denver", "Denver Broncos", "AFC", "West"),
    "DET": ("Detroit", "Detroit Lions", "NFC", "Central"),
    "GB":  ("Green Bay", "Green Bay Packers", "NFC", "Central"),
    "GIA": ("N.Y. Giants", "New York Giants", "NFC", "East"),
    "HOU": ("Houston", "Houston Oilers", "AFC", "Central"),
    "IND": ("Indianapolis", "Indianapolis Colts", "AFC", "East"),
    "JET": ("N.Y. Jets", "New York Jets", "AFC", "East"),
    "KC":  ("Kansas City", "Kansas City Chiefs", "AFC", "West"),
    "MIA": ("Miami", "Miami Dolphins", "AFC", "East"),
    "MIN": ("Minnesota", "Minnesota Vikings", "NFC", "Central"),
    "NE":  ("New England", "New England Patriots", "AFC", "East"),
    "NO":  ("New Orleans", "New Orleans Saints", "NFC", "West"),
    "PHI": ("Philadelphia", "Philadelphia Eagles", "NFC", "East"),
    "PHX": ("Phoenix", "Phoenix Cardinals", "NFC", "East"),
    "PIT": ("Pittsburgh", "Pittsburgh Steelers", "AFC", "Central"),
    "RAI": ("L.A. Raiders", "Los Angeles Raiders", "AFC", "West"),
    "RAM": ("L.A. Rams", "Los Angeles Rams", "NFC", "West"),
    "SD":  ("San Diego", "San Diego Chargers", "AFC", "West"),
    "SEA": ("Seattle", "Seattle Seahawks", "AFC", "West"),
    "SF":  ("San Francisco", "San Francisco 49ers", "NFC", "West"),
    "TB":  ("Tampa Bay", "Tampa Bay Buccaneers", "NFC", "Central"),
    "WAS": ("Washington", "Washington Redskins", "NFC", "East"),
}

# user code -> profile (displayName + bio fields). Sourced from tecmoheroes.com.
USER_PROFILES = {
    "PJ":    {
        "displayName": "PJ Street", "shortName": "PJ",
        "age": 38, "height": "5'7\"", "ethnicity": "All of Them",
        "team": "San Francisco 49ers", "from": "Biloxi, MS",
        "currentResidence": "Charlotte, NC",
        "seasonsPlayed": 17, "sbChampionships": 10, "recordsCount": 19,
        "bio": "Started Tecmo in 1992 in Biloxi, MS. Brought the original NES to the dorm in 2009 and turned it into a multi-decade league. Holder of the most Super Bowls and the most records.",
    },
    "WB":    {
        "displayName": "William Baucom", "shortName": "WB",
        "age": 38, "height": "Tall-ish", "ethnicity": "Mountain White",
        "team": "Houston Oilers", "from": "North Carolina",
        "currentResidence": "Clemmons, NC",
        "seasonsPlayed": 15, "sbChampionships": 2, "recordsCount": 7,
        "bio": "Run-and-shoot loyalist. Tied to Houston, Warren Moon, and Drew Hill — most of the league's gaudy passing numbers ride with him.",
    },
    "MA":    {
        "displayName": "Matt Andersen", "shortName": "MA",
        "age": 38, "height": "Taller", "ethnicity": "Yankee Pale",
        "team": "L.A. Raiders", "from": "New York",
        "currentResidence": "Winston-Salem, NC",
        "seasonsPlayed": 13, "sbChampionships": 3,
        "bio": "Raiders man early, Lions destroyer late. Bo Jackson seasons, then Barry Sanders carrying DET to Super Bowl 19.",
    },
    "CJ":    {
        "displayName": "Colby Joyner", "shortName": "CJ",
        "age": 38, "ethnicity": "Goes Outside",
        "team": "DA BEARS", "from": "Clemmons, NC",
        "currentResidence": "Bennettsville, SC",
        "seasonsPlayed": 10, "sbChampionships": 1, "recordsCount": 10,
    },
    "CR":    {
        "displayName": "Chris Rice", "shortName": "CR",
        "age": 38, "ethnicity": "All-American American",
        "team": "Buffalo Bills", "from": "Pennsylvania",
        "currentResidence": "Greensboro, NC",
        "seasonsPlayed": 8, "sbChampionships": 1,
    },
    "MAE":   {
        "displayName": "Mae Andersen", "shortName": "MAE",
        "age": 9, "ethnicity": "Chica Blanca",
        "team": "Buffalo Bills",
        "currentResidence": "Winston-Salem, NC",
        "seasonsPlayed": 3, "sbAppearances": 1,
    },
    "TD":    {
        "displayName": "Tyler Davis", "shortName": "TD",
        "age": 38, "ethnicity": "Actually Mountain White",
        "from": "North Carolina",
        "currentResidence": "North Wilkesboro, NC",
        "seasonsPlayed": 1,
    },
    "BF":    {
        "displayName": "Brian Foster", "shortName": "BF",
        "age": 39, "ethnicity": "Circus Stock",
        "team": "NY Giants",
        "from": "Winston-Salem, NC", "currentResidence": "Greensboro, NC",
        "seasonsPlayed": 1,
    },
    "AD":    {
        "displayName": "Andrew Denson", "shortName": "AD",
        "age": 40, "ethnicity": "Whitey",
        "team": "San Francisco 49ers", "from": "Guam",
        "seasonsPlayed": 1,
    },
    "COMP":  {
        "displayName": "Computer", "shortName": "COMP",
        "age": 33, "ethnicity": "I'm a Computer",
        "team": "Various",
        "seasonsPlayed": "Every Single One Ever",
        "sbChampionships": 4,
        "bio": "The 12-tier handicap pick teammate. Wins more Super Bowls than anyone wants to admit.",
    },
}

# normalize the position strings the spreadsheet uses to our Position type
POS_MAP = {
    "QB": "QB", "RB": "RB", "FB": "RB", "HB": "RB",
    "WR": "WR", "TE": "TE",
    "K": "K", "P": "P",
    "KR": "KR", "PR": "PR",
    "DL": "DL", "DT": "DT", "NT": "DT", "DE": "DE",
    "LB": "LB", "OLB": "LB", "ILB": "LB",
    "LOLB": "LB", "ROLB": "LB", "LILB": "LB", "RILB": "LB", "MLB": "LB",
    "DB": "DB", "CB": "CB", "LCB": "CB", "RCB": "CB",
    "S": "S", "SS": "S", "FS": "S",
}

# In-game generic-QB labels -> real NFL QB names
TEAM_QB_NAMES = {
    "BUF": "Jim Kelly",
    "PHI": "Randall Cunningham",
    "NE":  "Steve Grogan",
    "PHX": "Timm Rosenbach",
    "CIN": "Boomer Esiason",
    "GB":  "Don Majkowski",
    "MIN": "Wade Wilson",
    "WAS": "Mark Rypien",
    "ATL": "Chris Miller",
    "TB":  "Vinny Testaverde",
    "NO":  "John Fourcade",
    "IND": "Jeff George",
    "SD":  "Billy Joe Tolliver",
    "PIT": "Bubby Brister",
    "CLE": "Bernie Kosar",
    "SEA": "Dave Krieg",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def slugify(*parts: Any) -> str:
    s = "-".join(str(p) for p in parts if p)
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def norm_team(code: Any) -> str | None:
    if not code or not isinstance(code, str):
        return None
    code = code.strip()
    return TEAM_ALIASES.get(code, code)


def num(v: Any) -> Any:
    """Return v as int if it's an integer-valued float, else as-is."""
    if isinstance(v, float) and v.is_integer():
        return int(v)
    return v


# last-name aliases (common typos) -> canonical last name
LAST_NAME_ALIASES = {
    "MEGGET": "Meggett",  # spreadsheet uses both Megget and Meggett
}


def canonical_last(last: Any) -> str:
    if not isinstance(last, str):
        return ""
    s = last.strip()
    return LAST_NAME_ALIASES.get(s.upper(), s)


def player_key(last: Any, first: Any, team: str | None) -> str | None:
    """Stable dedup key: last-name (canonical) + team. First name disambiguates ties."""
    last = canonical_last(last)
    first = (first or "").strip() if isinstance(first, str) else ""
    if not last and not first:
        return None
    if first == "QB" and last:
        return slugify("qb", last, team)
    return slugify(last, team) if last else slugify(first, team)


_TG_ROSTER_CACHE: dict[str, list[dict[str, Any]]] = {}


def tg_roster(team_abbr: str) -> list[dict[str, Any]]:
    slug = TEAM_ABBR_TO_SLUG.get(team_abbr or "")
    if not slug:
        return []
    if slug in _TG_ROSTER_CACHE:
        return _TG_ROSTER_CACHE[slug]
    p = TECMOGEEK_DATA / f"{slug}.json"
    if not p.exists():
        _TG_ROSTER_CACHE[slug] = []
        return []
    try:
        data = json.loads(p.read_text())
    except Exception:
        data = {"players": []}
    _TG_ROSTER_CACHE[slug] = data.get("players", [])
    return _TG_ROSTER_CACHE[slug]


def find_sprite_slot(team_abbr: str | None, last: str, first: str, pos: str | None) -> tuple[str | None, int | None, str | None]:
    """Return (teamSlug, spriteIndex, real_name_from_roster)."""
    slug = TEAM_ABBR_TO_SLUG.get(team_abbr or "")
    if not slug:
        return (None, None, None)
    roster = tg_roster(team_abbr or "")

    last_n = (last or "").strip().lower()
    first_n = (first or "").strip().lower()

    def normalize_name(n: str) -> str:
        return n.lower().replace("'", "").replace(".", "").replace("-", " ").strip()

    # Try exact match by full real name then last-only
    for entry in roster:
        full = normalize_name(entry.get("name", ""))
        target_full = normalize_name(f"{first} {last}".strip())
        if full and full == target_full:
            ep = entry.get("position", "")
            if ep in HEADSHOT_POSITIONS:
                return (slug, HEADSHOT_POSITIONS.index(ep), entry.get("name"))
    # last-name match
    for entry in roster:
        full = entry.get("name", "")
        ln = normalize_name(full.split()[-1] if full else "")
        if ln and ln == normalize_name(last_n):
            ep = entry.get("position", "")
            if ep in HEADSHOT_POSITIONS:
                return (slug, HEADSHOT_POSITIONS.index(ep), entry.get("name"))
    # In-game generic-QB ("Eagles QB", "Bills QB") -> use QB1
    if first.strip() == "QB":
        return (slug, 0, None)
    # Fallback by our internal position
    if pos:
        norm_pos = POS_MAP.get(pos.strip().upper())
        if norm_pos and norm_pos in POS_DEFAULT_SLOT:
            return (slug, POS_DEFAULT_SLOT[norm_pos], None)
    return (slug, None, None)


def player_identity(last: Any, first: Any, team: str | None, pos: str | None) -> dict[str, Any] | None:
    """Build a stable identity for a player row."""
    last = canonical_last(last)
    first = (first or "").strip() if isinstance(first, str) else ""
    if not last and not first:
        return None
    key = player_key(last, first, team)
    # Treat ('Eagles', 'QB') / ('Bills', 'QB') style as "team QB".
    if first == "QB" and last:
        team_label = last
        tecmo_name = "QB"
        real_name = TEAM_QB_NAMES.get(team or "", f"{team_label} QB")
    else:
        tecmo_name = last or first
        real_name = " ".join(p for p in [first, last] if p) or None

    team_slug, sprite_index, roster_real = find_sprite_slot(team, last, first, pos)
    if roster_real and (not real_name or " " not in real_name):
        real_name = roster_real

    return {
        "id": key,
        "slug": key,
        "tecmoName": tecmo_name,
        "realName": real_name,
        "position": POS_MAP.get((pos or "").strip().upper(), None) if pos else None,
        "team": team,
        "teamSlug": team_slug,
        "spriteIndex": sprite_index,
    }


def merge_player(existing: dict[str, Any], incoming: dict[str, Any]) -> dict[str, Any]:
    """Prefer richer fields from either side."""
    out = dict(existing)
    for k in ("realName", "position", "team", "bio", "teamSlug", "spriteIndex"):
        if out.get(k) in (None, "") and incoming.get(k) not in (None, ""):
            out[k] = incoming[k]
        elif k == "realName" and incoming.get(k):
            if existing.get(k) and " " not in existing[k] and " " in incoming[k]:
                out[k] = incoming[k]
    return out


def find_header_indices(header: tuple, names: list[str]) -> dict[str, int]:
    out: dict[str, int] = {}
    for i, h in enumerate(header):
        if isinstance(h, str) and h in names:
            out[h] = i
    return out


# ---------------------------------------------------------------------------
# Section configuration for the Summary sheet
# ---------------------------------------------------------------------------
# stat-section header text -> (category, value_column, unit, statName, scope)

PLAYER_SECTIONS = {
    "Most Attempts":                  ("passing", "ATT",     None,  "Most Pass Attempts", "season"),
    "Most Completions":               ("passing", "COMPS",   None,  "Most Completions", "season"),
    "Highest Completion %":           ("passing", "COMP %",  "%",   "Highest Completion %", "season"),
    "Most Passing Yards":             ("passing", "YDS",     "yds", "Most Passing Yards", "season"),
    "Highest Yards Per Attempt":      ("passing", "AVG YDS", None,  "Highest Yards Per Attempt", "season"),
    "Most Passing Touchdowns":        ("passing", "TD",      "TDs", "Most Passing TDs", "season"),
    "Fewest Interceptions":           ("passing", "INT",     None,  "Fewest Interceptions", "season"),
    "Highest QB Rating":              ("passing", "RATING",  None,  "Highest QB Rating", "season"),

    "Most Receptions":                ("receiving", "REC",     None,  "Most Receptions", "season"),
    "Most Receiving Yards":           ("receiving", "YDS",     "yds", "Most Receiving Yards", "season"),
    "Highest Average Yards Per Catch":("receiving", "AVG YDS", None,  "Highest Yards Per Catch", "season"),
    "Most Receiving Touchdowns":      ("receiving", "TDs",     "TDs", "Most Receiving TDs", "season"),

    "Most Rushing Yards":             ("rushing", "YDS",     "yds", "Most Rushing Yards", "season"),
    "Highest Average Yards Per Rush": ("rushing", "AVG YDS", None,  "Highest Yards Per Rush", "season"),
    "Most Rushing Touchdowns":        ("rushing", "TD",      "TDs", "Most Rushing TDs", "season"),

    "Most Points Scored":             ("scoring", "POINTS",  "pts", "Most Points Scored", "season"),

    "Most Punt Returns":              ("special-teams", "PUNT RET", None,  "Most Punt Returns", "season"),
    "Most Punt Return Yards":         ("special-teams", "YDS",      "yds", "Most Punt Return Yards", "season"),
    "Hightest Punt Return Average":   ("special-teams", "AVG",      None,  "Highest Punt Return Avg", "season"),
    "Most Punt Return Touchdowns":    ("special-teams", "TD",       "TDs", "Most Punt Return TDs", "season"),

    "Most Kick Returns":              ("special-teams", "KICK RET", None,  "Most Kick Returns", "season"),
    "Most Kick Return Yards":         ("special-teams", "YDS",      "yds", "Most Kick Return Yards", "season"),
    "Highest Kick Return Average":    ("special-teams", "AVG",      None,  "Highest Kick Return Avg", "season"),
    "Most Kick Return Touchdowns":    ("special-teams", "TD",       "TDs", "Most Kick Return TDs", "season"),

    "Most Punts":                     ("special-teams", "No",  None,  "Most Punts", "season"),
    "Most Punt Yards":                ("special-teams", "YDS", "yds", "Most Punt Yards", "season"),
    "Highest Punt Average":           ("special-teams", "AVG", None,  "Highest Punt Avg", "season"),

    "Most Sacks":                     ("defense", "SACKS", None, "Most Sacks", "season"),
    "Most Interceptions":             ("defense", "INT",   None, "Most Interceptions", "season"),
}

TEAM_SECTIONS = {
    "Highest Total Offense (Yards)":   ("team", "TOTAL OFF", "yds", "Highest Total Offense", "season"),
    "Highest Passing Offense (Yards)": ("team", "PASS OFF",  "yds", "Highest Passing Offense", "season"),
    "Highest Rushing Offense (Yards)": ("team", "RUSH OFF",  "yds", "Highest Rushing Offense", "season"),
    "Best Defense Overall (Yards)":    ("team", "TOTAL DEF", "yds", "Best Total Defense (yds allowed)", "season"),
    "Best Passing Defense (Yards)":    ("team", "PASS DEF",  "yds", "Best Passing Defense (yds allowed)", "season"),
    "Best Rushing Defense (Yards)":    ("team", "RUSH DEF",  "yds", "Best Rushing Defense (yds allowed)", "season"),
    "Most Points Forwarded":           ("team", "FOR",       "pts", "Most Points For", "season"),
    "Lowest Points Against":           ("team", "AGAINST",   "pts", "Lowest Points Against", "season"),
    "Best Point Differential":         ("team", "DIFF",      "pts", "Best Point Differential", "season"),
}


# ---------------------------------------------------------------------------
# Main conversion
# ---------------------------------------------------------------------------

def main() -> None:
    wb = openpyxl.load_workbook(XLSX, data_only=True)

    players: dict[str, dict[str, Any]] = {}
    user_codes: set[str] = set()
    team_codes: set[str] = set()
    season_year: dict[int, int] = {}

    # Pass 1 — collect players, users, teams, and seasons across the stat sheets.
    # Stat columns to keep per sheet (for player-season stat lines used to
    # compute personal-bests on the player detail page).
    sheet_stat_cols: dict[str, list[tuple[str, str, str | None, str]]] = {
        # sheet -> [ (column_name, output_key, unit, category) ]
        "Passing": [
            ("ATT",     "passAttempts",   None,  "passing"),
            ("COMPS",   "completions",    None,  "passing"),
            ("COMP %",  "completionPct",  "%",   "passing"),
            ("YDS",     "passYards",      "yds", "passing"),
            ("AVG YDS", "passYdsPerAtt",  None,  "passing"),
            ("TD",      "passTDs",        "TDs", "passing"),
            ("INT",     "interceptions",  None,  "passing"),
            ("RATING",  "qbRating",       None,  "passing"),
        ],
        "Receiving": [
            ("REC",     "receptions",     None,  "receiving"),
            ("YDS",     "recYards",       "yds", "receiving"),
            ("AVG YDS", "recYdsPerCatch", None,  "receiving"),
            ("TDs",     "recTDs",         "TDs", "receiving"),
        ],
        "Rushing": [
            ("ATT",     "rushAttempts",   None,  "rushing"),
            ("YDS",     "rushYards",      "yds", "rushing"),
            ("AVG YDS", "rushYdsPerAtt",  None,  "rushing"),
            ("TD",      "rushTDs",        "TDs", "rushing"),
        ],
        "Scoring": [
            ("POINTS",  "points",         "pts", "scoring"),
        ],
        "Punt Return": [
            ("PUNT RET", "puntReturns",   None,  "special-teams"),
            ("YDS",      "puntRetYards",  "yds", "special-teams"),
            ("AVG",      "puntRetAvg",    None,  "special-teams"),
            ("TD",       "puntRetTDs",    "TDs", "special-teams"),
        ],
        "Kick Return": [
            ("KICK RET", "kickReturns",   None,  "special-teams"),
            ("YDS",      "kickRetYards",  "yds", "special-teams"),
            ("AVG",      "kickRetAvg",    None,  "special-teams"),
            ("TD",       "kickRetTDs",    "TDs", "special-teams"),
        ],
        "Punt": [
            ("No",  "punts",     None,  "special-teams"),
            ("YDS", "puntYards", "yds", "special-teams"),
            ("AVG", "puntAvg",   None,  "special-teams"),
        ],
        "Defense": [
            ("SACKS", "sacks", None, "defense"),
            ("INT",   "defInterceptions", None, "defense"),
        ],
    }

    # Per-player per-season stat rows (cleaned for the JSON file).
    player_seasons: list[dict[str, Any]] = []

    stat_sheets = ["Passing", "Receiving", "Rushing", "Scoring",
                   "Punt Return", "Kick Return", "Punt", "Defense"]

    for sheet_name in stat_sheets:
        ws = wb[sheet_name]
        rows = list(ws.iter_rows(values_only=True))
        # find the header row (first row whose first cell is "POS")
        header_row = next(
            (r for r in rows if r and isinstance(r[0], str) and r[0].upper() == "POS"),
            None,
        )
        if not header_row:
            continue
        wanted = ["POS", "Last Name", "First Name", "Team", "User", "Season", "Year", "Solo"]
        wanted += [c[0] for c in sheet_stat_cols.get(sheet_name, [])]
        idx = find_header_indices(header_row, wanted)
        for r in rows:
            if not r or r is header_row:
                continue
            pos = r[idx["POS"]] if "POS" in idx else None
            if not isinstance(pos, str) or pos.upper() == "POS":
                continue
            last = r[idx["Last Name"]] if "Last Name" in idx else None
            first = r[idx["First Name"]] if "First Name" in idx else None
            team = norm_team(r[idx["Team"]]) if "Team" in idx else None
            user = r[idx["User"]] if "User" in idx else None
            season = r[idx["Season"]] if "Season" in idx else None
            year = r[idx["Year"]] if "Year" in idx else None

            if team and team in NFL_TEAMS:
                team_codes.add(team)
            if isinstance(user, str) and user.strip():
                # filter junk like "NO" used as a user (NO is a team)
                if user not in NFL_TEAMS and user not in TEAM_ALIASES:
                    user_codes.add(user.strip())
                else:
                    # the one row with User='NO' is Hilliard NO 2022 — that user is PJ
                    user_codes.add("PJ")
            if isinstance(season, (int, float)) and isinstance(year, (int, float)):
                season_year[int(season)] = int(year)

            ident = player_identity(last, first, team, pos)
            if ident:
                if ident["id"] in players:
                    players[ident["id"]] = merge_player(players[ident["id"]], ident)
                else:
                    players[ident["id"]] = ident

            # Capture stat values for this player-season row.
            stats: dict[str, Any] = {}
            for col, key, _unit, _cat in sheet_stat_cols.get(sheet_name, []):
                if col in idx:
                    v = r[idx[col]]
                    if isinstance(v, (int, float)):
                        stats[key] = num(v)
            if (
                ident
                and stats
                and isinstance(season, (int, float))
                and isinstance(user, str)
                and user.strip()
            ):
                user_norm = user.strip()
                if user_norm in NFL_TEAMS or user_norm in TEAM_ALIASES:
                    user_norm = "PJ"
                player_seasons.append({
                    "playerId": ident["id"],
                    "userId": user_norm,
                    "team": team,
                    "seasonId": int(season),
                    "year": int(year) if isinstance(year, (int, float)) else None,
                    "sheet": sheet_name,
                    **stats,
                })

    # Pass 2 — Team sheet (collect team-only seasons / users + per-team-season stats)
    team_seasons: list[dict[str, Any]] = []
    ws = wb["Team"]
    rows = list(ws.iter_rows(values_only=True))
    header_row = next(
        (r for r in rows if r and isinstance(r[0], str) and r[0] == "Team"),
        None,
    )
    if header_row:
        idx = find_header_indices(header_row, [
            "Team", "User", "Season", "Year",
            "W", "L", "T", "FOR", "AGAINST", "DIFF",
            "TOTAL OFF", "PASS OFF", "RUSH OFF",
            "TOTAL DEF", "PASS DEF", "RUSH DEF",
            "SUPERBOWL",
        ])
        for r in rows:
            if not r or r is header_row:
                continue
            t = norm_team(r[idx["Team"]]) if "Team" in idx else None
            u = r[idx["User"]] if "User" in idx else None
            s = r[idx["Season"]] if "Season" in idx else None
            y = r[idx["Year"]] if "Year" in idx else None
            if t and t in NFL_TEAMS:
                team_codes.add(t)
            if isinstance(u, str) and u.strip() and u not in NFL_TEAMS:
                user_codes.add(u.strip())
            if isinstance(s, (int, float)) and isinstance(y, (int, float)):
                season_year[int(s)] = int(y)
            if (
                isinstance(s, (int, float))
                and t
                and isinstance(u, str)
                and u.strip()
            ):
                def cell(name: str) -> Any:
                    if name not in idx:
                        return None
                    v = r[idx[name]]
                    return num(v) if isinstance(v, (int, float)) else v

                team_seasons.append({
                    "seasonId": int(s),
                    "year": int(y) if isinstance(y, (int, float)) else None,
                    "team": t,
                    "userId": u.strip(),
                    "w": cell("W") or 0,
                    "l": cell("L") or 0,
                    "t": cell("T") or 0,
                    "pf": cell("FOR") or 0,
                    "pa": cell("AGAINST") or 0,
                    "diff": cell("DIFF"),
                    "totalOff": cell("TOTAL OFF"),
                    "passOff": cell("PASS OFF"),
                    "rushOff": cell("RUSH OFF"),
                    "totalDef": cell("TOTAL DEF"),
                    "passDef": cell("PASS DEF"),
                    "rushDef": cell("RUSH DEF"),
                    "wonSuperBowl": bool(cell("SUPERBOWL")),
                })

    # ------ Build Summary records ------
    summary_records: list[dict[str, Any]] = []
    ws = wb["Summary (Non Solo)"]
    rows = list(ws.iter_rows(values_only=True))

    current_section: str | None = None
    current_header: tuple | None = None
    section_rows: list[tuple] = []

    def flush_section() -> None:
        nonlocal current_section, current_header, section_rows
        if not current_section or not current_header or not section_rows:
            current_section = None
            current_header = None
            section_rows = []
            return

        if current_section in PLAYER_SECTIONS:
            cfg = PLAYER_SECTIONS[current_section]
        elif current_section in TEAM_SECTIONS:
            cfg = TEAM_SECTIONS[current_section]
        else:
            current_section = None
            current_header = None
            section_rows = []
            return

        category, value_col, unit, stat_name, scope = cfg
        idx = find_header_indices(current_header, [
            "POS", "Last Name", "First Name", "Team", "User", "Season", "Year",
            value_col, "RATING",
        ])

        # Use only the rank-1 row(s); group ties at top value.
        if value_col not in idx:
            current_section = None
            current_header = None
            section_rows = []
            return
        v_i = idx[value_col]
        # filter rows that actually have a value
        usable = [r for r in section_rows if r[v_i] is not None]
        if not usable:
            current_section = None
            current_header = None
            section_rows = []
            return
        top_value = usable[0][v_i]
        tied = [r for r in usable if r[v_i] == top_value]

        if category == "team":
            team_idx = current_header.index("Team")
            user_idx = current_header.index("User")
            season_idx = current_header.index("Season")
            year_idx = current_header.index("Year")
            teams = sorted({norm_team(r[team_idx]) for r in tied if r[team_idx]} - {None})
            users = sorted({r[user_idx] for r in tied if isinstance(r[user_idx], str)})
            seasons = sorted({int(r[season_idx]) for r in tied if isinstance(r[season_idx], (int, float))})
            years_list = sorted({int(r[year_idx]) for r in tied if isinstance(r[year_idx], (int, float))})
            rid = slugify(category, stat_name,
                          "-".join(teams) or "team",
                          str(num(top_value)))
            summary_records.append({
                "id": rid,
                "category": category,
                "scope": scope,
                "statName": stat_name,
                "value": num(top_value),
                **({"unit": unit} if unit else {}),
                "tecmoPlayerIds": [],
                "userIds": users,
                "teamAbbrs": teams,
                "seasonId": seasons[0] if len(seasons) == 1 else None,
                "seasonIds": seasons,
                "years": years_list,
                "dateAchieved": str(years_list[0]) if years_list else None,
            })
        else:
            pos_i = idx["POS"]
            last_i = idx["Last Name"]
            first_i = idx["First Name"]
            team_i = idx["Team"]
            user_i = idx["User"]
            season_i = idx["Season"]
            year_i = idx["Year"]

            tecmo_ids: list[str] = []
            user_ids: list[str] = []
            team_abbrs: list[str] = []
            season_ids: list[int] = []
            years: list[int] = []
            for r in tied:
                team = norm_team(r[team_i])
                ident = player_identity(r[last_i], r[first_i], team, r[pos_i])
                if ident:
                    if ident["id"] in players:
                        players[ident["id"]] = merge_player(players[ident["id"]], ident)
                    else:
                        players[ident["id"]] = ident
                    if ident["id"] not in tecmo_ids:
                        tecmo_ids.append(ident["id"])
                if isinstance(r[user_i], str) and r[user_i] not in user_ids:
                    user_ids.append(r[user_i])
                if team and team not in team_abbrs:
                    team_abbrs.append(team)
                if isinstance(r[season_i], (int, float)):
                    season_ids.append(int(r[season_i]))
                if isinstance(r[year_i], (int, float)):
                    years.append(int(r[year_i]))

            actual_category = category
            if category == "scoring":
                # bucket scoring records into the position's category
                first_pos = (tied[0][pos_i] or "").upper()
                if first_pos in ("RB", "FB", "HB"):
                    actual_category = "rushing"
                elif first_pos in ("WR", "TE"):
                    actual_category = "receiving"
                elif first_pos == "K":
                    actual_category = "special-teams"
                else:
                    actual_category = "team"

            rid = slugify(actual_category, stat_name,
                          tecmo_ids[0] if tecmo_ids else "team",
                          str(num(top_value)))
            unique_seasons = sorted(set(season_ids))
            unique_years = sorted(set(years))
            summary_records.append({
                "id": rid,
                "category": actual_category,
                "scope": scope,
                "statName": stat_name,
                "value": num(top_value),
                **({"unit": unit} if unit else {}),
                "tecmoPlayerIds": tecmo_ids,
                "userIds": user_ids,
                "teamAbbrs": team_abbrs,
                "seasonId": unique_seasons[0] if len(unique_seasons) == 1 else None,
                "seasonIds": unique_seasons,
                "years": unique_years,
                "dateAchieved": str(unique_years[0]) if unique_years else None,
            })

        current_section = None
        current_header = None
        section_rows = []

    section_keys = set(PLAYER_SECTIONS) | set(TEAM_SECTIONS)
    for r in rows:
        if not r:
            continue
        first = r[0]
        # blank row
        if first is None and all(c is None for c in r):
            flush_section()
            continue
        if isinstance(first, str):
            if first in section_keys:
                flush_section()
                current_section = first
                current_header = None
                continue
            # category banner like "TECMO PASSING RECORDS"
            if first.startswith("TECMO ") and first.endswith("RECORDS"):
                flush_section()
                continue
            # header row
            if first.upper() in ("POS", "TEAM"):
                current_header = r
                continue
        if current_section and current_header:
            section_rows.append(r)
    flush_section()

    # ------ Super Bowl records ------
    sb_records: list[dict[str, Any]] = []
    season_sb: dict[int, dict[str, Any]] = {}
    ws = wb["Superbowls"]
    rows = list(ws.iter_rows(values_only=True))
    header_row = next(
        (r for r in rows if r and isinstance(r[0], str) and r[0] == "Season"),
        None,
    )
    season_champs: dict[int, str] = {}
    if header_row:
        idx = find_header_indices(header_row, [
            "Season", "Year", "AFC", "NFC", "Score AFC", "Score NFC",
            "AFC User", "NFC User", "Notes", "Location",
        ])
        for r in rows:
            if not r or r is header_row:
                continue
            s = r[idx["Season"]] if "Season" in idx else None
            y = r[idx["Year"]] if "Year" in idx else None
            if not isinstance(s, (int, float)):
                continue
            sid = int(s)
            year = int(y) if isinstance(y, (int, float)) else None
            afc = norm_team(r[idx["AFC"]]) if "AFC" in idx else None
            nfc = norm_team(r[idx["NFC"]]) if "NFC" in idx else None
            sa = r[idx["Score AFC"]] if "Score AFC" in idx else None
            sn = r[idx["Score NFC"]] if "Score NFC" in idx else None
            au = r[idx["AFC User"]] if "AFC User" in idx else None
            nu = r[idx["NFC User"]] if "NFC User" in idx else None
            notes = r[idx["Notes"]] if "Notes" in idx else None
            location = r[idx["Location"]] if "Location" in idx else None
            if isinstance(sa, (int, float)) and isinstance(sn, (int, float)):
                if sa > sn:
                    champ, runner = afc, nfc
                    champ_user, runner_user = au, nu
                    champ_score, runner_score = int(sa), int(sn)
                else:
                    champ, runner = nfc, afc
                    champ_user, runner_user = nu, au
                    champ_score, runner_score = int(sn), int(sa)
                if champ:
                    season_champs[sid] = champ
                # Champion-only record (no opponent in the record itself).
                rid = slugify("sb", sid, champ or "champ")
                sb_records.append({
                    "id": rid,
                    "category": "team",
                    "scope": "super-bowl",
                    "statName": f"Super Bowl {sid} Champion",
                    "value": champ or "—",
                    "tecmoPlayerIds": [],
                    "userIds": [champ_user] if isinstance(champ_user, str) else [],
                    "teamAbbrs": [champ] if champ else [],
                    "seasonId": sid,
                    "dateAchieved": str(year) if year else None,
                })
                # Full game lives on seasons.json so the season page can render it.
                season_sb[sid] = {
                    "champion": champ,
                    "championUser": champ_user if isinstance(champ_user, str) else None,
                    "championScore": champ_score,
                    "runnerUp": runner,
                    "runnerUpUser": runner_user if isinstance(runner_user, str) else None,
                    "runnerUpScore": runner_score,
                    "afc": afc, "nfc": nfc,
                    "afcUser": au if isinstance(au, str) else None,
                    "nfcUser": nu if isinstance(nu, str) else None,
                    "afcScore": int(sa), "nfcScore": int(sn),
                    "location": location if isinstance(location, str) else None,
                    "notes": notes if isinstance(notes, str) else None,
                }
                if isinstance(au, str) and au.strip():
                    user_codes.add(au.strip())
                if isinstance(nu, str) and nu.strip():
                    user_codes.add(nu.strip())

    # ------ MVP / OPOY / DPOY records ------
    award_records: list[dict[str, Any]] = []
    ws = wb["MVPs"]
    rows = list(ws.iter_rows(values_only=True))
    header_row = next(
        (r for r in rows if r and isinstance(r[0], str) and r[0] == "Season"),
        None,
    )
    if header_row:
        idx = find_header_indices(header_row, [
            "Season", "Year", "Award", "Last Name", "First Name",
            "Team", "POS", "User", "Notes",
        ])
        for r in rows:
            if not r or r is header_row:
                continue
            s = r[idx["Season"]] if "Season" in idx else None
            if not isinstance(s, (int, float)):
                continue
            sid = int(s)
            year = r[idx["Year"]] if "Year" in idx else None
            award = r[idx["Award"]] if "Award" in idx else "MVP"
            last = r[idx["Last Name"]] if "Last Name" in idx else None
            first = r[idx["First Name"]] if "First Name" in idx else None
            team = norm_team(r[idx["Team"]]) if "Team" in idx else None
            pos = r[idx["POS"]] if "POS" in idx else None
            user = r[idx["User"]] if "User" in idx else None
            notes = r[idx["Notes"]] if "Notes" in idx else None
            ident = player_identity(last, first, team, pos)
            if ident:
                if ident["id"] in players:
                    players[ident["id"]] = merge_player(players[ident["id"]], ident)
                else:
                    players[ident["id"]] = ident
            rid = slugify("award", award, sid, ident["id"] if ident else "mvp")
            label = (ident["realName"] or ident["tecmoName"]) if ident else "—"
            award_records.append({
                "id": rid,
                "category": "team",
                "scope": "season",
                "statName": f"Season {sid} {award}",
                "value": label,
                "tecmoPlayerIds": [ident["id"]] if ident else [],
                "userIds": [user] if isinstance(user, str) else [],
                "teamAbbrs": [team] if team else [],
                "seasonId": sid,
                "dateAchieved": str(int(year)) if isinstance(year, (int, float)) else None,
                "notes": notes if isinstance(notes, str) else None,
            })
            if isinstance(user, str) and user.strip():
                user_codes.add(user.strip())

    # ------ Nicknames -> attach to players ------
    nicks: dict[str, list[str]] = {}
    ws = wb["Nicknames"]
    for r in ws.iter_rows(values_only=True):
        if not r or not r[0] or not r[1]:
            continue
        full_name = str(r[0]).strip()
        nick = str(r[1]).strip()
        if not full_name or not nick:
            continue
        # match against a player's realName
        matches = [pid for pid, p in players.items() if (p.get("realName") or "").lower() == full_name.lower()]
        for pid in matches:
            nicks.setdefault(pid, []).append(nick)
    for pid, names in nicks.items():
        existing = players[pid].get("bio") or ""
        nick_line = "Nicknames: " + "; ".join(names)
        players[pid]["bio"] = (existing + " " + nick_line).strip() if existing else nick_line

    # ---------------------------------------------------------------------
    # Assemble output JSON
    # ---------------------------------------------------------------------

    teams_out = []
    # always include all NFL teams that appear in the data plus the standard set
    all_team_codes = sorted(team_codes | {"GB", "MIN"})
    for code in all_team_codes:
        meta = NFL_TEAMS.get(code)
        if not meta:
            continue
        d, full, conf, div = meta
        teams_out.append({
            "abbr": code,
            "displayName": d,
            "fullName": full,
            "conference": conf,
            "division": div,
        })

    seasons_out = []
    for sid in sorted(season_year):
        entry: dict[str, Any] = {"id": sid, "year": season_year[sid]}
        if sid in season_champs:
            entry["championTeam"] = season_champs[sid]
        if sid in season_sb:
            entry["superBowl"] = season_sb[sid]
        seasons_out.append(entry)

    # Users
    users_out = []
    for code in sorted(user_codes):
        profile = USER_PROFILES.get(code, {"displayName": code})
        entry = {"id": code, "slug": slugify(code), **profile}
        users_out.append(entry)

    # Players — clean up
    players_out = []
    for ident in players.values():
        ident = dict(ident)
        # drop empty optionals so the JSON stays tidy
        for k in ("realName", "position", "team", "bio", "teamSlug"):
            if ident.get(k) in (None, "None", ""):
                ident.pop(k, None)
        if ident.get("spriteIndex") is None:
            ident.pop("spriteIndex", None)
        players_out.append(ident)
    players_out.sort(key=lambda p: (p.get("team") or "", p.get("position") or "", p["tecmoName"]))

    # Records
    records_out = summary_records + sb_records + award_records

    # Three top-level groups; record.category remains the granular sub-category
    # (passing/rushing/etc.) and is used for the in-page section headers.
    categories_out = [
        {
            "id": "offense", "label": "Offense",
            "blurb": "Passing, rushing, and receiving records.",
            "subcategories": ["passing", "rushing", "receiving"],
        },
        {
            "id": "defense-special-teams", "label": "Defense & Special Teams",
            "blurb": "Sacks, interceptions, returns, punts, kicks.",
            "subcategories": ["defense", "special-teams"],
        },
        {
            "id": "team", "label": "Team",
            "blurb": "Team season totals, MVPs, and Super Bowls.",
            "subcategories": ["team"],
        },
    ]

    # Sort the auxiliary datasets so diffs are stable.
    team_seasons.sort(key=lambda x: (x["seasonId"], x["team"], x["userId"]))
    player_seasons.sort(key=lambda x: (x["seasonId"], x["playerId"], x["sheet"]))

    # Write everything.
    write_json(DATA / "categories.json", categories_out)
    write_json(DATA / "teams.json", teams_out)
    write_json(DATA / "users.json", users_out)
    write_json(DATA / "seasons.json", seasons_out)
    write_json(DATA / "players.json", players_out)
    write_json(DATA / "records.json", records_out)
    write_json(DATA / "team-seasons.json", team_seasons)
    write_json(DATA / "player-stats.json", player_seasons)

    print(f"Wrote {len(teams_out)} teams, {len(users_out)} users, "
          f"{len(seasons_out)} seasons, {len(players_out)} players, "
          f"{len(records_out)} records, "
          f"{len(team_seasons)} team-seasons, {len(player_seasons)} player-season statlines.")


def write_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
