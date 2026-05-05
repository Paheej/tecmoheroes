import { existsSync } from "node:fs";
import path from "node:path";
import type { TecmoPlayer } from "@/lib/types";
import { teamByAbbr } from "@/lib/data";

interface Props {
  player: TecmoPlayer;
  compact?: boolean;
}

const TEAM_COLORS: Record<string, string> = {
  Hou: "#0e305a", Phi: "#06402b", Det: "#005a8b", Rai: "#1a1a1a",
  KC: "#b91c1c", Atl: "#7c1010", SF: "#9b1b1b", Buf: "#0a3a8b",
  Bug: "#0a3a8b", Min: "#3a0e6e", NO: "#7a5a00", Pit: "#3a3a00",
  Den: "#5a2a00", Sea: "#0e3a4a", Jets: "#053b1a", Ind: "#0a2566",
  Chi: "#0a1a3a", Rams: "#3a2a00", TB: "#5a2a0a", SD: "#0a2566",
  Cle: "#5a2a0a", NE: "#0a1a3a", Was: "#5a0a0a", GB: "#0e3a1a", Phx: "#7a0a3a",
};

export default function TecmoProfileCard({ player, compact = false }: Props) {
  const team = player.team ? teamByAbbr.get(player.team) : null;
  const teamBg = TEAM_COLORS[player.team ?? ""] ?? "#1a1a1a";

  const spriteFile = player.spriteSlug
    ? path.join(process.cwd(), "public", "sprites", `${player.spriteSlug}.png`)
    : null;
  const hasSprite = spriteFile ? existsSync(spriteFile) : false;

  return (
    <div
      className={`pixel-border bg-black text-[var(--color-tecmo-ink)] ${
        compact ? "w-44" : "w-64"
      }`}
    >
      {/* Top banner: team */}
      <div
        className="px-3 py-1 text-xs uppercase tracking-widest text-center font-bold"
        style={{ background: teamBg }}
      >
        {team?.displayName ?? player.team ?? "—"}
      </div>

      {/* Sprite area */}
      <div
        className="relative tecmo-grid h-32 flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${teamBg} 0%, #000 100%)` }}
      >
        {hasSprite ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/sprites/${player.spriteSlug}.png`}
            alt={player.tecmoName}
            className="h-28 w-auto pixelated"
            style={{ imageRendering: "pixelated" }}
          />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div
              aria-hidden
              className="h-16 w-16 grid grid-cols-4 grid-rows-4 gap-[2px]"
              title="Sprite placeholder — drop public/sprites/{slug}.png to replace"
            >
              {/* 16-cell pixel-art helmet stand-in */}
              {[
                0,1,1,0,
                1,1,1,1,
                1,2,2,1,
                0,1,1,0,
              ].map((c, i) => (
                <div
                  key={i}
                  className="w-full h-full"
                  style={{
                    background:
                      c === 0 ? "transparent" : c === 1 ? "var(--color-tecmo-gold)" : "#000",
                  }}
                />
              ))}
            </div>
            <span className="text-[10px] opacity-60 uppercase">sprite slot</span>
          </div>
        )}
      </div>

      {/* Name + position */}
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
