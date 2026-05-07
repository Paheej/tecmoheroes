import Link from "next/link";
import type { SuperBowlGame } from "@/lib/types";
import { teamByAbbr, userById } from "@/lib/data";
import { Helmet } from "./Sprites";

interface Props {
  game: SuperBowlGame;
  seasonId: number;
  /** When set, render the season number as a link to the season page. */
  linkToSeason?: boolean;
}

export default function SuperBowlPanel({
  game,
  seasonId,
  linkToSeason = false,
}: Props) {
  const champTeam = game.champion ? teamByAbbr.get(game.champion) : null;
  const ruTeam = game.runnerUp ? teamByAbbr.get(game.runnerUp) : null;
  const champUser = game.championUser ? userById.get(game.championUser) : null;
  const ruUser = game.runnerUpUser ? userById.get(game.runnerUpUser) : null;

  return (
    <section className="border-2 border-[var(--color-tecmo-gold)] bg-black/70 p-5">
      <div className="text-[10px] uppercase tracking-widest opacity-70">
        {linkToSeason ? (
          <Link
            href={`/seasons/${seasonId}`}
            className="hover:text-[var(--color-tecmo-gold)]"
          >
            Super Bowl {seasonId}
          </Link>
        ) : (
          <>Super Bowl {seasonId}</>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mt-3">
        <div className="flex items-center gap-3 justify-end text-right">
          <div>
            <div className="font-bold uppercase text-base">
              {champTeam?.displayName ?? game.champion}
            </div>
            {champUser && (
              <Link
                href={`/heroes/${champUser.slug}`}
                className="text-xs opacity-80 hover:text-[var(--color-tecmo-gold)]"
              >
                {champUser.displayName}
              </Link>
            )}
          </div>
          <Helmet abbr={game.champion} size={48} />
        </div>
        <div className="text-center">
          <div className="text-3xl font-black text-[var(--color-tecmo-gold)] tecmo-headline whitespace-nowrap">
            {game.championScore} — {game.runnerUpScore}
          </div>
          <div className="text-[10px] uppercase opacity-60 mt-1">Final</div>
        </div>
        <div className="flex items-center gap-3">
          <Helmet abbr={game.runnerUp} size={48} />
          <div>
            <div className="font-bold uppercase text-base opacity-90">
              {ruTeam?.displayName ?? game.runnerUp}
            </div>
            {ruUser && (
              <Link
                href={`/heroes/${ruUser.slug}`}
                className="text-xs opacity-80 hover:text-[var(--color-tecmo-gold)]"
              >
                {ruUser.displayName}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs opacity-80">
        {game.location && (
          <span>
            <span className="uppercase opacity-60">Location:</span> {game.location}
          </span>
        )}
        {game.afc && game.nfc && (
          <span className="flex items-center gap-2">
            <span className="uppercase opacity-60">AFC:</span>
            <Helmet abbr={game.afc} size={18} withLabel />
            <span className="opacity-60 ml-3 uppercase">NFC:</span>
            <Helmet abbr={game.nfc} size={18} withLabel />
          </span>
        )}
      </div>

      {game.notes && (
        <p className="mt-3 text-xs italic opacity-80 max-w-prose">{game.notes}</p>
      )}
    </section>
  );
}
