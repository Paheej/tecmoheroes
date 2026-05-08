import Link from "next/link";
import type { Record } from "@/lib/types";
import { playerById, userById, seasonById, recordFocusIndexes } from "@/lib/data";
import { scopeLabel, formatValue } from "@/lib/format";
import { Headshot, Helmet } from "./Sprites";

interface Props {
  record: Record;
  /** Hide the player avatar/name (used when shown on the player's own page). */
  showFullProfile?: boolean;
  /** On a player detail page, narrow tied-record details to this player's slice. */
  focusPlayerId?: string;
  /** On a hero detail page, narrow tied-record details to this hero's slice. */
  focusUserId?: string;
}

export default function RecordCard({
  record,
  showFullProfile = true,
  focusPlayerId,
  focusUserId,
}: Props) {
  const idxs = recordFocusIndexes(record, {
    playerId: focusPlayerId,
    userId: focusUserId,
  });
  const players = uniq(idxs.map((i) => record.tecmoPlayerIds[i]).filter(Boolean))
    .map((id) => playerById.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const users = uniq(idxs.map((i) => record.userIds[i]).filter(Boolean))
    .map((id) => userById.get(id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));
  const teamAbbrs = uniq(idxs.map((i) => record.teamAbbrs[i]).filter(Boolean));

  const seasonPairs = seasonYearPairs(record, idxs);

  return (
    <article className="border-2 border-[var(--color-tecmo-gold)] bg-black/70 p-4">
      <header className="flex items-baseline justify-between gap-3 border-b border-[var(--color-tecmo-gold)]/40 pb-2 mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest opacity-70">
            {scopeLabel[record.scope]}
          </div>
          <h3
            className={`text-lg font-bold uppercase ${
              record.asterisk ? "tecmo-asterisk" : ""
            }`}
          >
            {record.statName}
          </h3>
        </div>
        <div className="text-3xl font-black text-[var(--color-tecmo-gold)] tecmo-headline">
          {formatValue(record.value, record.unit)}
        </div>
      </header>

      {showFullProfile && players.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
          {players.map((p) => (
            <Link
              key={p.id}
              href={`/players/${p.slug}`}
              className="flex items-center gap-2 hover:text-[var(--color-tecmo-gold)]"
            >
              <Headshot
                teamSlug={p.teamSlug}
                spriteIndex={p.spriteIndex}
                size={40}
                className="border border-black/40"
              />
              <div className="leading-tight">
                <div className="font-bold uppercase text-sm">{p.tecmoName}</div>
                {p.realName && p.realName !== p.tecmoName && (
                  <div className="text-[10px] opacity-70">{p.realName}</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        {users.length > 0 && (
          <span>
            <span className="opacity-60 uppercase">Hero:</span>{" "}
            {users.map((u, i) => (
              <span key={u.id}>
                <Link
                  href={`/heroes/${u.slug}`}
                  className="font-bold hover:text-[var(--color-tecmo-gold)] underline-offset-4"
                  title={u.displayName}
                >
                  {u.shortName ?? u.displayName}
                </Link>
                {i < users.length - 1 ? ", " : ""}
              </span>
            ))}
          </span>
        )}
        {teamAbbrs.length > 0 && (
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="opacity-60 uppercase">Team:</span>
            {teamAbbrs.map((abbr) => (
              <Helmet key={abbr} abbr={abbr} size={20} withLabel />
            ))}
          </span>
        )}
        {seasonPairs.length > 0 && (
          <span className="flex flex-wrap items-center gap-x-1 gap-y-1">
            <span className="opacity-60 uppercase">Season:</span>
            {seasonPairs.map(({ seasonId, year }, i) => (
              <span key={`${seasonId}-${i}`}>
                <Link
                  href={`/seasons/${seasonId}`}
                  className="hover:text-[var(--color-tecmo-gold)] font-bold"
                >
                  #{seasonId}
                </Link>
                {year != null && <span className="opacity-70"> ({year})</span>}
                {i < seasonPairs.length - 1 ? "," : ""}
              </span>
            ))}
          </span>
        )}
      </footer>

      {record.notes && (
        <p className="mt-2 text-xs italic opacity-75">{record.notes}</p>
      )}
    </article>
  );
}

function seasonYearPairs(
  record: Record,
  idxs: number[],
): { seasonId: number; year: number | null }[] {
  if (record.seasonIds && record.seasonIds.length > 0) {
    return uniq(idxs.map((i) => record.seasonIds![i]).filter((v): v is number => v != null))
      .map((id) => ({ seasonId: id, year: seasonById.get(id)?.year ?? null }));
  }
  if (record.seasonId != null) {
    return [{ seasonId: record.seasonId, year: seasonById.get(record.seasonId)?.year ?? null }];
  }
  return [];
}

function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
