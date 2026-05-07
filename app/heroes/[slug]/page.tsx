import Link from "next/link";
import { notFound } from "next/navigation";
import {
  users,
  userBySlug,
  recordsForUser,
  awardsForUser,
  championshipsForUser,
  sbAppearancesForUser,
  isStatRecord,
  awardKind,
  playerById,
  mostPlayedTeamForUser,
  teamSeasonsForUser,
  teamByAbbr,
  bioForUser,
  seasonById,
} from "@/lib/data";
import RecordCard from "@/components/RecordCard";
import { Helmet } from "@/components/Sprites";

export function generateStaticParams() {
  return users.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = userBySlug.get(slug);
  return { title: user ? `${user.displayName} — Tecmo Heroes` : "Tecmo Heroes" };
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = userBySlug.get(slug);
  if (!user) notFound();
  const statRecs = recordsForUser(user.id).filter(isStatRecord);
  const awards = awardsForUser(user.id);
  const championships = championshipsForUser(user.id);
  const appearances = sbAppearancesForUser(user.id);
  const mostTeam = mostPlayedTeamForUser(user.id);
  const seasons = teamSeasonsForUser(user.id);

  const mostTeamLabel = mostTeam
    ? `${teamByAbbr.get(mostTeam.team)?.displayName ?? mostTeam.team} (${mostTeam.seasons} season${mostTeam.seasons === 1 ? "" : "s"}, ${mostTeam.w}-${mostTeam.l}${mostTeam.t ? `-${mostTeam.t}` : ""})`
    : undefined;

  const stats: [string, string | number | undefined][] = [
    ["Age", user.age],
    ["Height", user.height],
    ["Ethnicity", user.ethnicity],
    ["Most-Played Team", mostTeamLabel ?? user.team],
    ["From", user.from],
    ["Currently", user.currentResidence],
    ["Seasons", seasons.length || user.seasonsPlayed],
    ["SB Appearances", appearances.length || user.sbAppearances],
    ["Championships", championships.length || user.sbChampionships],
    ["Awards", awards.length || undefined],
    ["Records", statRecs.length || user.recordsCount],
  ];

  return (
    <div className="space-y-8">
      <header>
        <div className="text-xs uppercase opacity-60">Hero</div>
        <h1 className="tecmo-headline text-4xl text-[var(--color-tecmo-gold)]">
          {user.displayName}
          {user.shortName && user.shortName !== user.displayName && (
            <span className="opacity-60 text-2xl ml-3">({user.shortName})</span>
          )}
        </h1>
        {(() => {
          const blurb = bioForUser(user.id);
          return blurb ? (
            <p className="opacity-80 mt-2 max-w-prose">{blurb}</p>
          ) : null;
        })()}
      </header>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm border-2 border-[var(--color-tecmo-gold)] p-4 bg-black/60">
        {stats
          .filter(([, v]) => v !== undefined && v !== null && v !== "")
          .map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-[var(--color-tecmo-gold)]/20 py-1">
              <span className="opacity-60 uppercase text-[10px]">{k}</span>
              <span className="font-bold text-right">{String(v)}</span>
            </div>
          ))}
      </div>

      {championships.length > 0 && (
        <section className="border-2 border-[var(--color-tecmo-gold)] bg-black/60 p-4">
          <h2 className="tecmo-headline text-xl mb-3">
            Championships ({championships.length})
          </h2>
          <ul className="space-y-2 text-sm">
            {championships.map((c) => (
              <li
                key={`champ-${c.seasonId}`}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--color-tecmo-gold)]/20 pb-1"
              >
                <Link
                  href={`/seasons/${c.seasonId}`}
                  className="text-[var(--color-tecmo-gold)] font-bold tecmo-headline w-24 hover:opacity-80"
                >
                  Season {c.seasonId}
                </Link>
                <span className="opacity-60 text-xs">{c.year}</span>
                <Helmet abbr={c.team} size={18} withLabel />
                <span className="opacity-60 text-xs">def.</span>
                <Helmet abbr={c.opponentTeam} size={18} withLabel />
                <span className="font-bold">
                  {c.scoreFor}–{c.scoreAgainst}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {appearances.length > 0 && (
        <section className="border-2 border-[var(--color-tecmo-gold)] bg-black/60 p-4">
          <h2 className="tecmo-headline text-xl mb-3">
            Super Bowl Appearances ({appearances.length})
          </h2>
          <ul className="space-y-2 text-sm">
            {appearances.map((a) => (
              <li
                key={`sb-${a.seasonId}-${a.team}`}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--color-tecmo-gold)]/20 pb-1"
              >
                <Link
                  href={`/seasons/${a.seasonId}`}
                  className="text-[var(--color-tecmo-gold)] font-bold tecmo-headline w-24 hover:opacity-80"
                >
                  Season {a.seasonId}
                </Link>
                <span className="opacity-60 text-xs">{a.year}</span>
                <Helmet abbr={a.team} size={18} withLabel />
                <span className="opacity-60 text-xs">vs.</span>
                <Helmet abbr={a.opponentTeam} size={18} withLabel />
                <span className="font-bold">
                  {a.scoreFor}–{a.scoreAgainst}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-widest ${
                    a.won
                      ? "text-[var(--color-tecmo-gold)]"
                      : "opacity-60"
                  }`}
                >
                  {a.won ? "Win" : "Loss"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {awards.length > 0 && (
        <section className="border-2 border-[var(--color-tecmo-gold)] bg-black/60 p-4">
          <h2 className="tecmo-headline text-xl mb-3">Awards ({awards.length})</h2>
          <ul className="space-y-2 text-sm">
            {awards.map((a) => {
              const kind = awardKind(a) ?? "Award";
              const player = a.tecmoPlayerIds[0]
                ? playerById.get(a.tecmoPlayerIds[0])
                : undefined;
              return (
                <li
                  key={a.id}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--color-tecmo-gold)]/20 pb-1"
                >
                  <span className="text-[var(--color-tecmo-gold)] font-bold tecmo-headline w-16">
                    {kind}
                  </span>
                  {a.seasonId != null && (
                    <Link
                      href={`/seasons/${a.seasonId}`}
                      className="hover:text-[var(--color-tecmo-gold)]"
                    >
                      Season {a.seasonId}
                    </Link>
                  )}
                  {player ? (
                    <Link
                      href={`/players/${player.slug}`}
                      className="font-bold hover:text-[var(--color-tecmo-gold)]"
                    >
                      {player.realName ?? player.tecmoName}
                    </Link>
                  ) : (
                    <span className="font-bold">{String(a.value)}</span>
                  )}
                  {a.teamAbbrs[0] && (
                    <Helmet abbr={a.teamAbbrs[0]} size={18} withLabel />
                  )}
                  {a.notes && (
                    <p className="text-xs opacity-75 italic basis-full pl-20">
                      {a.notes}
                    </p>
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
              <RecordCard key={r.id} record={r} />
            ))}
          </div>
        )}
      </section>

      {seasons.length > 0 && (
        <section className="border-2 border-[var(--color-tecmo-gold)] bg-black/60 p-4">
          <h2 className="tecmo-headline text-xl mb-3">
            Season-by-season ({seasons.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[var(--color-tecmo-gold)] text-left">
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">Season</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">Year</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">Team</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70 text-right">W</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70 text-right">L</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70 text-right">T</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70 text-right">PF</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70 text-right">PA</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">SB</th>
                </tr>
              </thead>
              <tbody>
                {[...seasons]
                  .sort((a, b) => a.seasonId - b.seasonId)
                  .map((s, i) => {
                    const yr = s.year ?? seasonById.get(s.seasonId)?.year ?? null;
                    return (
                      <tr
                        key={`${s.seasonId}-${s.team}-${i}`}
                        className="border-b border-[var(--color-tecmo-gold)]/20 hover:bg-white/5"
                      >
                        <td className="py-2 px-2">
                          <Link
                            href={`/seasons/${s.seasonId}`}
                            className="font-bold hover:text-[var(--color-tecmo-gold)]"
                          >
                            #{s.seasonId}
                          </Link>
                        </td>
                        <td className="py-2 px-2 opacity-80">{yr ?? "—"}</td>
                        <td className="py-2 px-2">
                          <Helmet abbr={s.team} size={18} withLabel />
                        </td>
                        <td className="py-2 px-2 text-right">{s.w}</td>
                        <td className="py-2 px-2 text-right">{s.l}</td>
                        <td className="py-2 px-2 text-right">{s.t}</td>
                        <td className="py-2 px-2 text-right">{s.pf}</td>
                        <td className="py-2 px-2 text-right">{s.pa}</td>
                        <td className="py-2 px-2 text-[var(--color-tecmo-gold)]">
                          {s.wonSuperBowl ? "★" : ""}
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
