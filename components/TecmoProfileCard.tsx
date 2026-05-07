import type { TecmoPlayer } from "@/lib/types";
import { teamByAbbr } from "@/lib/data";
import { Headshot } from "./Sprites";

interface Props {
  player: TecmoPlayer;
  compact?: boolean;
}

const TEAM_COLORS: Record<string, string> = {
  HOU: "#0e305a", PHI: "#06402b", DET: "#005a8b", RAI: "#1a1a1a",
  KC: "#b91c1c", ATL: "#7c1010", SF: "#9b1b1b", BUF: "#0a3a8b",
  MIN: "#3a0e6e", NO: "#7a5a00", PIT: "#3a3a00",
  DEN: "#5a2a00", SEA: "#0e3a4a", JET: "#053b1a", IND: "#0a2566",
  CHI: "#0a1a3a", RAM: "#3a2a00", TB: "#5a2a0a", SD: "#0a2566",
  CLE: "#5a2a0a", NE: "#0a1a3a", WAS: "#5a0a0a", GB: "#0e3a1a", PHX: "#7a0a3a",
  CIN: "#5a2a00", DAL: "#0a2566", MIA: "#0e3a4a", GIA: "#0a1a3a",
};

export default function TecmoProfileCard({ player, compact = false }: Props) {
  const team = player.team ? teamByAbbr.get(player.team) : null;
  const teamBg = TEAM_COLORS[player.team ?? ""] ?? "#1a1a1a";
  const headshotSize = compact ? 64 : 96;

  return (
    <div
      className={`pixel-border bg-black text-[var(--color-tecmo-ink)] ${
        compact ? "w-44" : "w-64"
      }`}
    >
      <div
        className="px-3 py-1 text-xs uppercase tracking-widest text-center font-bold"
        style={{ background: teamBg }}
      >
        {team?.displayName ?? player.team ?? "—"}
      </div>

      <div
        className="relative tecmo-grid h-32 flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${teamBg} 0%, #000 100%)` }}
      >
        {player.teamSlug && player.spriteIndex != null ? (
          <Headshot
            teamSlug={player.teamSlug}
            spriteIndex={player.spriteIndex}
            size={headshotSize}
          />
        ) : (
          <span className="text-[10px] opacity-60 uppercase">no sprite</span>
        )}
      </div>

      <div className="bg-[var(--color-tecmo-gold)] text-black px-3 py-1 flex items-baseline justify-between">
        <span className="font-bold uppercase tracking-wider">
          {player.tecmoName}
        </span>
        {player.position && (
          <span className="text-[10px] font-bold bg-black text-[var(--color-tecmo-gold)] px-1.5 py-0.5">
            {player.position}
          </span>
        )}
      </div>

      {!compact && (
        <div className="px-3 py-2 text-[11px] space-y-0.5">
          {player.realName && (
            <div>
              <span className="opacity-60">REAL:</span>{" "}
              <span className="font-bold">{player.realName}</span>
            </div>
          )}
          {player.bio && <p className="opacity-80 mt-1">{player.bio}</p>}
        </div>
      )}
    </div>
  );
}
