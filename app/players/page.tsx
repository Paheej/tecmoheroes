import Link from "next/link";
import { players, recordsForPlayer, awardsForPlayer, isStatRecord } from "@/lib/data";
import TecmoProfileCard from "@/components/TecmoProfileCard";

export const metadata = { title: "Players — Tecmo Heroes" };

export default function PlayersIndex() {
  // Only list in-game players who actually hold at least one record.
  const heroes = players
    .map((p) => ({
      p,
      count: recordsForPlayer(p.id).filter(isStatRecord).length,
      awards: awardsForPlayer(p.id).length,
    }))
    .filter((x) => x.count > 0 || x.awards > 0)
    .sort(
      (a, b) =>
        b.count - a.count ||
        b.awards - a.awards ||
        a.p.tecmoName.localeCompare(b.p.tecmoName),
    );

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase opacity-60">Players</div>
        <h1 className="tecmo-headline text-4xl text-[var(--color-tecmo-gold)]">
          The Players
        </h1>
        <p className="opacity-80 mt-1 max-w-2xl text-sm">
          The in-game characters who hold a league record. Each card pairs the
          on-cartridge name with the real NFL identity behind it.
        </p>
      </header>

      <ul className="grid gap-6 md:grid-cols-3">
        {heroes.map(({ p, count, awards }) => (
          <li key={p.id} className="flex flex-col items-start gap-2">
            <Link href={`/players/${p.slug}`} className="hover:opacity-80">
              <TecmoProfileCard player={p} compact />
            </Link>
            <div className="text-xs opacity-80 flex flex-wrap gap-x-2">
              <span className="text-[var(--color-tecmo-gold)] font-bold">
                {count} record{count === 1 ? "" : "s"}
              </span>
              {awards > 0 && (
                <>
                  <span className="opacity-60">·</span>
                  <span className="font-bold">
                    {awards} Award{awards === 1 ? "" : "s"}
                  </span>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
