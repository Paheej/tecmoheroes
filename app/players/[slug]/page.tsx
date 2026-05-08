import Link from "next/link";
import { notFound } from "next/navigation";
import {
  players,
  playerBySlug,
  recordsForPlayer,
  awardsForPlayer,
  isStatRecord,
  awardKind,
  userById,
  playerStatsForPlayer,
  personalBestsForPlayer,
  bioForPlayer,
  heroesForPlayer,
  seasonById,
} from "@/lib/data";
import TecmoProfileCard from "@/components/TecmoProfileCard";
import { Helmet, HeroAvatar } from "@/components/Sprites";
import RecordCard from "@/components/RecordCard";
import { formatValue, scopeLabel } from "@/lib/format";

export function generateStaticParams() {
  return players.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const player = playerBySlug.get(slug);
  return { title: player ? `${player.tecmoName} — Tecmo Heroes` : "Tecmo Heroes" };
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const player = playerBySlug.get(slug);
  if (!player) notFound();
  const statRecs = recordsForPlayer(player.id).filter(isStatRecord);
  const awards = awardsForPlayer(player.id);
  const stats = playerStatsForPlayer(player.id);
  const heroes = heroesForPlayer(player.id);
  const personalBests = personalBestsForPlayer(player.id);
  const blurb = bioForPlayer(player.id);

  // Season summary (per player-season, summed across stat sheets).
  const seasonRows = summarizePlayerSeasons(stats);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row gap-6 items-start border-2 border-[var(--color-tecmo-gold)] bg-black/60 p-4">
        <TecmoProfileCard player={player} />
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase opacity-60">Player</div>
          <h1 className="tecmo-headline text-3xl text-[var(--color-tecmo-gold)] mt-1">
            {player.realName ?? player.tecmoName}
          </h1>
          <div className="text-sm opacity-80 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>
              In-game: <span className="font-bold">{player.tecmoName}</span>
            </span>
            {player.position && <span>· {player.position}</span>}
            {player.team && (
              <>
                <span>·</span>
                <Helmet abbr={player.team} size={20} withLabel />
              </>
            )}
          </div>
          <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
            <div className="flex justify-between gap-3 border-b border-[var(--color-tecmo-gold)]/20 py-1">
              <dt className="opacity-60 uppercase">Records</dt>
              <dd className="font-bold text-right text-[var(--color-tecmo-gold)]">
                {statRecs.length}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--color-tecmo-gold)]/20 py-1">
              <dt className="opacity-60 uppercase">Awards</dt>
              <dd className="font-bold text-right">{awards.length}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--color-tecmo-gold)]/20 py-1">
              <dt className="opacity-60 uppercase">Seasons</dt>
              <dd className="font-bold text-right">{seasonRows.length}</dd>
            </div>
          </dl>
          {blurb && (
            <p className="mt-3 text-sm opacity-90 max-w-prose">{blurb}</p>
          )}
        </div>
      </header>

      {awards.length > 0 && (
        <section className="border-2 border-[var(--color-tecmo-gold)] bg-black/60 p-4">
          <h2 className="tecmo-headline text-xl mb-3">Awards ({awards.length})</h2>
          <ul className="space-y-2 text-sm">
            {awards.map((a) => {
              const kind = awardKind(a) ?? "Award";
              const user = a.userIds[0] ? userById.get(a.userIds[0]) : undefined;
              return (
                <li
                  key={a.id}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--color-tecmo-gold)]/20 pb-1"
                >
                  <span className="text-[var(--color-tecmo-gold)] font-bold tecmo-headline w-16">
                    {kind}
                  </span>
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    {a.seasonId != null && (
                      <Link
                        href={`/seasons/${a.seasonId}`}
                        className="hover:text-[var(--color-tecmo-gold)]"
                      >
                        Season {a.seasonId}
                      </Link>
                    )}
                    {a.dateAchieved && (
                      <span className="opacity-60 text-xs">· {a.dateAchieved}</span>
                    )}
                    {a.teamAbbrs[0] && (
                      <Helmet abbr={a.teamAbbrs[0]} size={18} withLabel />
                    )}
                    {user && (
                      <>
                        <span className="opacity-60 text-xs">· played by</span>
                        <Link
                          href={`/heroes/${user.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs hover:text-[var(--color-tecmo-gold)]"
                          title={user.displayName}
                        >
                          <HeroAvatar
                            slug={user.slug}
                            size={20}
                            className="border border-black/40"
                          />
                          <span>{user.shortName ?? user.displayName}</span>
                        </Link>
                      </>
                    )}
                  </span>
                  {a.notes && (
                    <p className="text-xs opacity-75 italic basis-full pl-16">{a.notes}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <h2 className="tecmo-headline text-xl mb-3">
          Records held ({statRecs.length})
        </h2>
        {statRecs.length === 0 ? (
          <p className="opacity-60 text-sm">No records logged for this player.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {statRecs.map((r) => (
              <RecordCard
                key={r.id}
                record={r}
                showFullProfile={false}
                focusPlayerId={player.id}
              />
            ))}
          </div>
        )}
      </section>

      {seasonRows.length > 0 && (
        <section className="border-2 border-[var(--color-tecmo-gold)] bg-black/60 p-4">
          <h2 className="tecmo-headline text-xl mb-3">
            Season-by-season ({seasonRows.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[var(--color-tecmo-gold)] text-left">
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">Season</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">Year</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">Team</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">Hero</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70 text-right">Highlights</th>
                </tr>
              </thead>
              <tbody>
                {seasonRows.map((row, i) => {
                  const u = userById.get(row.userId);
                  return (
                    <tr
                      key={`${row.seasonId}-${row.team}-${i}`}
                      className="border-b border-[var(--color-tecmo-gold)]/20 hover:bg-white/5"
                    >
                      <td className="py-2 px-2">
                        <Link
                          href={`/seasons/${row.seasonId}`}
                          className="font-bold hover:text-[var(--color-tecmo-gold)]"
                        >
                          #{row.seasonId}
                        </Link>
                      </td>
                      <td className="py-2 px-2 opacity-80">
                        {row.year ?? seasonById.get(row.seasonId)?.year ?? "—"}
                      </td>
                      <td className="py-2 px-2">
                        {row.team ? (
                          <Helmet abbr={row.team} size={18} withLabel />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2 px-2">
                        {u ? (
                          <Link
                            href={`/heroes/${u.slug}`}
                            className="inline-flex items-center gap-1.5 hover:text-[var(--color-tecmo-gold)]"
                            title={u.displayName}
                          >
                            <HeroAvatar
                              slug={u.slug}
                              size={20}
                              className="border border-black/40"
                            />
                            <span>{u.shortName ?? u.displayName}</span>
                          </Link>
                        ) : (
                          row.userId
                        )}
                      </td>
                      <td className="py-2 px-2 text-right text-xs opacity-90">
                        {row.highlights}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {personalBests.length > 0 && (
        <section className="space-y-3">
          <h2 className="tecmo-headline text-xl">
            Personal best by category ({personalBests.length})
          </h2>
          <div className="overflow-x-auto border-2 border-[var(--color-tecmo-gold)] bg-black/60">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-[var(--color-tecmo-gold)]">
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">Category</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">Stat</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">Value</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">Hero</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">Season</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">Year</th>
                </tr>
              </thead>
              <tbody>
                {personalBests.map((b, i) => {
                  const u = b.userId ? userById.get(b.userId) : undefined;
                  return (
                    <tr
                      key={`${b.category}-${b.statName}-${i}`}
                      className="border-b border-[var(--color-tecmo-gold)]/20 hover:bg-white/5"
                    >
                      <td className="py-2 px-2 text-[10px] uppercase opacity-70 align-top">
                        {scopeLabel.season} · {b.category.replace(/-/g, " ")}
                      </td>
                      <td className="py-2 px-2 font-bold uppercase align-top">
                        {b.statName}
                      </td>
                      <td className="py-2 px-2 text-[var(--color-tecmo-gold)] font-black tecmo-headline whitespace-nowrap align-top">
                        {formatValue(b.value, b.unit)}
                      </td>
                      <td className="py-2 px-2 align-top">
                        {u ? (
                          <Link
                            href={`/heroes/${u.slug}`}
                            className="inline-flex items-center gap-1.5 hover:text-[var(--color-tecmo-gold)]"
                            title={u.displayName}
                          >
                            <HeroAvatar
                              slug={u.slug}
                              size={20}
                              className="border border-black/40"
                            />
                            <span>{u.shortName ?? u.displayName}</span>
                          </Link>
                        ) : (
                          b.userId ?? "—"
                        )}
                      </td>
                      <td className="py-2 px-2 align-top">
                        <Link
                          href={`/seasons/${b.seasonId}`}
                          className="hover:text-[var(--color-tecmo-gold)]"
                        >
                          #{b.seasonId}
                        </Link>
                      </td>
                      <td className="py-2 px-2 opacity-80 align-top">
                        {b.year ?? seasonById.get(b.seasonId)?.year ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

interface PlayerSeasonRow {
  seasonId: number;
  year: number | null | undefined;
  team?: string | null;
  userId: string;
  highlights: string;
}

function summarizePlayerSeasons(
  stats: ReturnType<typeof playerStatsForPlayer>,
): PlayerSeasonRow[] {
  const grouped = new Map<string, PlayerSeasonRow & { totals: Record<string, number> }>();
  for (const s of stats) {
    const key = `${s.seasonId}-${s.team ?? ""}-${s.userId}`;
    const existing = grouped.get(key) ?? {
      seasonId: s.seasonId,
      year: s.year,
      team: s.team ?? null,
      userId: s.userId,
      highlights: "",
      totals: {} as Record<string, number>,
    };
    for (const [k, v] of Object.entries(s)) {
      if (typeof v === "number" && k !== "seasonId" && k !== "year") {
        existing.totals[k] = (existing.totals[k] ?? 0) + v;
      }
    }
    grouped.set(key, existing);
  }
  const rows = [...grouped.values()].map((g) => {
    const bits: string[] = [];
    const t = g.totals;
    if (t.passYards) bits.push(`${t.passYards.toLocaleString()} pass yd`);
    if (t.passTDs) bits.push(`${t.passTDs} pTD`);
    if (t.rushYards) bits.push(`${t.rushYards.toLocaleString()} rush yd`);
    if (t.rushTDs) bits.push(`${t.rushTDs} rTD`);
    if (t.recYards) bits.push(`${t.recYards.toLocaleString()} rec yd`);
    if (t.recTDs) bits.push(`${t.recTDs} reTD`);
    if (t.sacks) bits.push(`${t.sacks} sk`);
    if (t.defInterceptions) bits.push(`${t.defInterceptions} INT`);
    if (t.points) bits.push(`${t.points} pts`);
    if (t.puntRetTDs) bits.push(`${t.puntRetTDs} prTD`);
    if (t.kickRetTDs) bits.push(`${t.kickRetTDs} krTD`);
    return {
      seasonId: g.seasonId,
      year: g.year,
      team: g.team,
      userId: g.userId,
      highlights: bits.join(", ") || "—",
    } satisfies PlayerSeasonRow;
  });
  rows.sort((a, b) => a.seasonId - b.seasonId);
  return rows;
}
