import Link from "next/link";
import { players, recordsForPlayer } from "@/lib/data";
import TecmoProfileCard from "@/components/TecmoProfileCard";

export const metadata = { title: "Players — Tecmo Heroes" };

export default function PlayersIndex() {
  const sorted = [...players].sort((a, b) => {
    const ra = recordsForPlayer(a.id).length;
    const rb = recordsForPlayer(b.id).length;
    if (rb !== ra) return rb - ra;
    return a.tecmoName.localeCompare(b.tecmoName);
  });

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase opacity-60">Players</div>
        <h1 className="tecmo-headline text-4xl text-[var(--color-tecmo-gold)]">
          The Roster
        </h1>
        <p className="opacity-80 mt-1">
          Tecmo names, real NFL identities, and who's holding what.
        </p>
      </header>

      <ul className="grid gap-6 md:grid-cols-3">
        {sorted.map((p) => {
          const count = recordsForPlayer(p.id).length;
          return (
            <li key={p.id} className="flex flex-col items-start gap-2">
              <Link href={`/players/${p.slug}`} className="hover:opacity-80">
                <TecmoProfileCard player={p} compact />
              </Link>
              <div className="text-xs opacity-80">
                {count > 0 ? (
                  <span className="text-[var(--color-tecmo-gold)] font-bold">
                    {count} record{count === 1 ? "" : "s"}
                  </span>
                ) : (
                  <span className="opacity-60">no records logged</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
