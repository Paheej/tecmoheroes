import { teamByAbbr } from "@/lib/data";

const TEAM_SLUGS = [
  "49ers", "bears", "bengals", "bills", "broncos", "browns", "buccaneers",
  "cardinals", "chargers", "chiefs", "colts", "cowboys", "dolphins", "eagles",
  "falcons", "giants", "jets", "lions", "oilers", "packers", "patriots",
  "raiders", "rams", "redskins", "saints", "seahawks", "steelers", "vikings",
] as const;

type TeamSlug = (typeof TEAM_SLUGS)[number];

const ABBR_TO_SLUG: Record<string, TeamSlug> = {
  ATL: "falcons", BUF: "bills", CHI: "bears", CIN: "bengals",
  CLE: "browns", DAL: "cowboys", DEN: "broncos", DET: "lions",
  GB: "packers", GIA: "giants", HOU: "oilers", IND: "colts",
  JET: "jets", KC: "chiefs", MIA: "dolphins", MIN: "vikings",
  NE: "patriots", NO: "saints", PHI: "eagles", PHX: "cardinals",
  PIT: "steelers", RAI: "raiders", RAM: "rams", SD: "chargers",
  SEA: "seahawks", SF: "49ers", TB: "buccaneers", WAS: "redskins",
};

export function teamSlugFromAbbr(abbr: string | null | undefined): TeamSlug | null {
  if (!abbr) return null;
  return ABBR_TO_SLUG[abbr] ?? null;
}

interface HelmetProps {
  abbr: string;
  size?: number;          // rendered px (helmet is square-ish 30x30 default)
  className?: string;
  withLabel?: boolean;    // render abbr after the helmet
  title?: string;
}

/**
 * Small NES-helmet sprite sliced from public/sprites/helmets.png
 * (28-team strip downloaded from ubuwaits/tecmogeek). Falls back to plain text
 * for unknown teams.
 */
export function Helmet({
  abbr,
  size = 22,
  className = "",
  withLabel = false,
  title,
}: HelmetProps) {
  const slug = teamSlugFromAbbr(abbr);
  if (!slug) {
    return <span className={className}>{abbr}</span>;
  }
  const teamIndex = TEAM_SLUGS.indexOf(slug);
  // Source helmets-strip is ~1734x60. Scale-down: use bg-size width = teams * step.
  const step = size + 1;
  const totalWidth = TEAM_SLUGS.length * step;
  const team = teamByAbbr.get(abbr);
  return (
    <span
      className={`inline-flex items-center gap-1 align-middle ${className}`}
      title={title ?? team?.fullName ?? abbr}
    >
      <span
        aria-hidden="true"
        className="inline-block bg-no-repeat align-middle shrink-0"
        style={{
          width: size,
          height: size,
          backgroundImage: "url(/sprites/helmets.png)",
          backgroundSize: `${totalWidth}px ${size}px`,
          backgroundPosition: `${teamIndex * -step}px 0`,
          imageRendering: "pixelated",
        }}
      />
      {withLabel && <span className="text-xs uppercase">{abbr}</span>}
    </span>
  );
}

interface HeroAvatarProps {
  slug: string | null | undefined;
  size?: number;
  className?: string;
  title?: string;
}

/**
 * Square photo avatar for a hero, sourced from /avatars/{slug}.png.
 * Background is sized 110% to crop the outer ~5% of the source — without
 * it, the uniform sky/wall row at the very top of each photo becomes a
 * single bright pixel-row when scaled small.
 */
export function HeroAvatar({
  slug,
  size = 32,
  className = "",
  title,
}: HeroAvatarProps) {
  if (!slug) return null;
  return (
    <span
      aria-hidden="true"
      title={title}
      className={`inline-block bg-no-repeat align-middle shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(/avatars/${slug}.png)`,
        backgroundSize: "110% 110%",
        backgroundPosition: "center",
      }}
    />
  );
}

interface HeadshotProps {
  teamSlug: string | null | undefined;
  spriteIndex: number | null | undefined;
  size?: number;
  className?: string;
}

/**
 * 32x32 NES headshot sliced from /sprites/teams/{slug}.png (per-team strip
 * mirrors tecmogeek's HEADSHOT_POSITIONS layout).
 */
export function Headshot({
  teamSlug,
  spriteIndex,
  size = 32,
  className = "",
}: HeadshotProps) {
  if (!teamSlug || spriteIndex == null) return null;
  const totalWidth = (size * 30); // 30 sprite slots per team strip
  return (
    <span
      aria-hidden="true"
      className={`inline-block bg-no-repeat align-middle ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(/sprites/teams/${teamSlug}.png)`,
        backgroundSize: `${totalWidth}px ${size}px`,
        backgroundPosition: `${spriteIndex * -size}px 0`,
        imageRendering: "pixelated",
      }}
    />
  );
}
