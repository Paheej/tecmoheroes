import Link from "next/link";
import {
  users,
  recordsForUser,
  awardsForUser,
  isStatRecord,
  championshipsForUser,
  sbAppearancesForUser,
  mostPlayedTeamForUser,
  bioForUser,
} from "@/lib/data";
import { Helmet } from "@/components/Sprites";

export const metadata = { title: "The Heroes — Tecmo Heroes" };

export default function HeroesIndex() {
  const sorted = [...users].sort((a, b) => {
    const ra = recordsForUser(a.id).filter(isStatRecord).length;
    const rb = recordsForUser(b.id).filter(isStatRecord).length;
    if (rb !== ra) return rb - ra;
    return a.displayName.localeCompare(b.displayName);
  });

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase opacity-60">The Heroes</div>
        <h1 className="tecmo-headline text-4xl text-[var(--color-tecmo-gold)]">
          The Heroes
        </h1>
        <p className="opacity-80 mt-1 max-w-2xl text-sm">
          The humans who play the league. Roll calls, Super Bowls, and records
          all live behind these initials.
        </p>
      </header>

      <ul className="grid gap-3 md:grid-cols-2">
        {sorted.map((u) => {
          const records = recordsForUser(u.id).filter(isStatRecord).length;
          const champs = championshipsForUser(u.id).length;
          const sbApps = sbAppearancesForUser(u.id).length;
          const awards = awardsForUser(u.id).length;
          const mostTeam = mostPlayedTeamForUser(u.id);
          return (
            <li key={u.id}>
              <Link
                href={`/heroes/${u.slug}`}
                className="block border-2 border-[var(--color-tecmo-gold)] p-3 hover:bg-white/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold uppercase">
                      {u.shortName ? `${u.shortName} · ` : ""}
                      {u.displayName}
                    </div>
                    <div className="text-[11px] opacity-70 mt-1 flex flex-wrap gap-x-4">
                      {mostTeam ? (
                        <span className="flex items-center gap-1">
                          <Helmet abbr={mostTeam.team} size={16} withLabel />
                          <span className="opacity-70">
                            ({mostTeam.seasons} season{mostTeam.seasons === 1 ? "" : "s"})
                          </span>
                        </span>
                      ) : (
                        u.team && <span>Team: {u.team}</span>
                      )}
                      {u.seasonsPlayed !== undefined && (
                        <span>{u.seasonsPlayed} seasons</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-xs whitespace-nowrap leading-tight">
                    <div className="text-[var(--color-tecmo-gold)] font-bold">
                      {records} record{records === 1 ? "" : "s"}
                    </div>
                    <div className="opacity-80">
                      {champs} championship{champs === 1 ? "" : "s"}
                    </div>
                    <div className="opacity-80">
                      {sbApps} SB appearance{sbApps === 1 ? "" : "s"}
                    </div>
                    <div className="opacity-80">
                      {awards} award{awards === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>
                {(() => {
                  const blurb = bioForUser(u.id);
                  return blurb ? (
                    <p className="text-xs opacity-80 mt-2">{blurb}</p>
                  ) : null;
                })()}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
