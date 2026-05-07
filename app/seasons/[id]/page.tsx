import Link from "next/link";
import { notFound } from "next/navigation";
import {
  seasons,
  seasonById,
  statRecordsForSeason,
  awardsForSeason,
  awardKind,
  userById,
  playerById,
  teamSeasonsForSeason,
} from "@/lib/data";
import RecordCard from "@/components/RecordCard";
import SuperBowlPanel from "@/components/SuperBowlPanel";
import { Helmet } from "@/components/Sprites";
import type { Record } from "@/lib/types";

export function generateStaticParams() {
  return seasons.map((s) => ({ id: String(s.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return { title: `Season ${id} — Tecmo Heroes` };
}

export default async function SeasonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const season = seasonById.get(Number(id));
  if (!season) notFound();
  const statRecs = statRecordsForSeason(season.id);
  const awards = awardsForSeason(season.id);

  return (
    <div className="space-y-8">
      <header>
        <div className="text-xs uppercase opacity-60">Season</div>
        <h1 className="tecmo-headline text-4xl text-[var(--color-tecmo-gold)]">
          Season {season.id} · {season.year}
        </h1>
        {season.notes && <p className="mt-2 opacity-80">{season.notes}</p>}
      </header>

      {season.superBowl && (
        <SuperBowlPanel game={season.superBowl} seasonId={season.id} />
      )}

      <section>
        <h2 className="tecmo-headline text-xl mb-3">
          Single-season records ({statRecs.length})
        </h2>
        {statRecs.length === 0 ? (
          <p className="opacity-60 text-sm">No statistical records for this season.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {statRecs.map((r) => (
              <RecordCard key={r.id} record={r} />
            ))}
          </div>
        )}
      </section>

      {awards.length > 0 && <AwardsPanel records={awards} />}

      <SeasonHeroesPanel seasonId={season.id} />
    </div>
  );
}

function SeasonHeroesPanel({ seasonId }: { seasonId: number }) {
  const rows = teamSeasonsForSeason(seasonId);
  if (rows.length === 0) return null;

  // Sort: real heroes first (highest win pct), COMP last for legibility.
  const sorted = [...rows].sort((a, b) => {
    if ((a.userId === "COMP") !== (b.userId === "COMP")) {
      return a.userId === "COMP" ? 1 : -1;
    }
    const ag = a.w + a.l + a.t;
    const bg = b.w + b.l + b.t;
    const ap = ag === 0 ? 0 : (a.w + 0.5 * a.t) / ag;
    const bp = bg === 0 ? 0 : (b.w + 0.5 * b.t) / bg;
    if (bp !== ap) return bp - ap;
    return b.w - a.w;
  });

  return (
    <section className="border-2 border-[var(--color-tecmo-gold)] bg-black/60 p-4">
      <h2 className="tecmo-headline text-xl mb-3">Heroes this season ({sorted.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-[var(--color-tecmo-gold)] text-left">
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">Hero</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">Team</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70 text-right">W</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70 text-right">L</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70 text-right">T</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70 text-right">PF</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70 text-right">PA</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => {
              const u = userById.get(r.userId);
              return (
                <tr
                  key={`${r.team}-${r.userId}-${i}`}
                  className="border-b border-[var(--color-tecmo-gold)]/20 hover:bg-white/5"
                >
                  <td className="py-2 px-2">
                    {u ? (
                      <Link
                        href={`/heroes/${u.slug}`}
                        className="font-bold hover:text-[var(--color-tecmo-gold)]"
                      >
                        {u.shortName ?? u.displayName}
                      </Link>
                    ) : (
                      <span className="font-bold opacity-80">{r.userId}</span>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    <Helmet abbr={r.team} size={20} withLabel />
                  </td>
                  <td className="py-2 px-2 text-right">{r.w}</td>
                  <td className="py-2 px-2 text-right">{r.l}</td>
                  <td className="py-2 px-2 text-right">{r.t}</td>
                  <td className="py-2 px-2 text-right">{r.pf}</td>
                  <td className="py-2 px-2 text-right">{r.pa}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AwardsPanel({ records }: { records: Record[] }) {
  return (
    <section className="border-2 border-[var(--color-tecmo-gold)] bg-black/60 p-4">
      <h2 className="tecmo-headline text-xl mb-3">Awards</h2>
      <ul className="space-y-2 text-sm">
        {records.map((r) => {
          const award = awardKind(r) ?? "Award";
          const player = r.tecmoPlayerIds[0]
            ? playerById.get(r.tecmoPlayerIds[0])
            : undefined;
          const user = r.userIds[0] ? userById.get(r.userIds[0]) : undefined;
          return (
            <li
              key={r.id}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--color-tecmo-gold)]/20 pb-1"
            >
              <span className="text-[var(--color-tecmo-gold)] font-bold tecmo-headline w-16">
                {award}
              </span>
              <span className="flex flex-wrap items-baseline gap-x-2">
                {player ? (
                  <Link
                    href={`/players/${player.slug}`}
                    className="font-bold hover:text-[var(--color-tecmo-gold)]"
                  >
                    {player.realName ?? player.tecmoName}
                  </Link>
                ) : (
                  String(r.value)
                )}
                {r.teamAbbrs[0] && (
                  <Helmet abbr={r.teamAbbrs[0]} size={18} withLabel />
                )}
                {user && (
                  <>
                    <span className="opacity-60 text-xs">· played by</span>
                    <Link
                      href={`/heroes/${user.slug}`}
                      className="text-xs hover:text-[var(--color-tecmo-gold)]"
                    >
                      {user.shortName ?? user.displayName}
                    </Link>
                  </>
                )}
              </span>
              {r.notes && (
                <p className="text-xs opacity-75 italic basis-full pl-16">{r.notes}</p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
