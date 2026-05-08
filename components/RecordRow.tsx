import Link from "next/link";
import type { Record } from "@/lib/types";
import { playerById, userById, seasonById } from "@/lib/data";
import { formatValue, scopeLabel } from "@/lib/format";
import { Headshot, Helmet, HeroAvatar } from "./Sprites";

interface Props {
  record: Record;
  variant?: "default" | "team";
}

export default function RecordRow({ record, variant = "default" }: Props) {
  const players = record.tecmoPlayerIds
    .map((id) => playerById.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const users = record.userIds
    .map((id) => userById.get(id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

  const seasonIds = record.seasonIds && record.seasonIds.length > 0
    ? record.seasonIds
    : record.seasonId != null
      ? [record.seasonId]
      : [];
  const years = record.years && record.years.length > 0
    ? record.years
    : record.dateAchieved
      ? [Number(record.dateAchieved)].filter((n) => !Number.isNaN(n))
      : [];

  return (
    <tr className="border-b border-[var(--color-tecmo-gold)]/20 hover:bg-white/5">
      <td className="py-3 px-2 text-[10px] uppercase opacity-70 align-top">
        {scopeLabel[record.scope]}
      </td>
      <td className={`py-3 px-2 font-bold uppercase align-top ${record.asterisk ? "tecmo-asterisk" : ""}`}>
        {record.statName}
      </td>
      <td className="py-3 px-2 text-[var(--color-tecmo-gold)] font-black tecmo-headline whitespace-nowrap align-top">
        {formatValue(record.value, record.unit)}
      </td>
      <td className="py-3 px-2 text-xs align-top">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {users.map((u, i) => (
            <span key={u.id} className="inline-flex items-center gap-x-1">
              <Link
                href={`/heroes/${u.slug}`}
                className="inline-flex items-center gap-1.5 hover:text-[var(--color-tecmo-gold)] underline-offset-4"
                title={u.displayName}
              >
                <HeroAvatar
                  slug={u.slug}
                  size={28}
                  className="border border-black/40"
                />
                <span>{u.shortName ?? u.displayName}</span>
              </Link>
              {i < users.length - 1 ? <span>,</span> : null}
            </span>
          ))}
        </div>
      </td>
      {variant !== "team" && (
        <td className="py-3 px-2 align-top">
          <div className="flex items-center gap-2 flex-wrap">
            {players.map((p) => (
              <Link
                key={p.id}
                href={`/players/${p.slug}`}
                className="flex items-center gap-1.5 hover:text-[var(--color-tecmo-gold)]"
                title={p.realName ?? p.tecmoName}
              >
                <Headshot
                  teamSlug={p.teamSlug}
                  spriteIndex={p.spriteIndex}
                  size={28}
                  className="border border-black/40"
                />
                <span className="text-xs">{p.tecmoName}</span>
              </Link>
            ))}
          </div>
        </td>
      )}
      <td className="py-3 px-2 text-xs opacity-90 align-top">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {record.teamAbbrs.map((abbr) => (
            <Helmet key={abbr} abbr={abbr} size={20} withLabel />
          ))}
        </div>
      </td>
      <td className="py-3 px-2 text-xs align-top">
        {seasonIds.length > 0 ? (
          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
            {seasonIds.map((id) => (
              <Link
                key={id}
                href={`/seasons/${id}`}
                className="hover:text-[var(--color-tecmo-gold)] whitespace-nowrap"
              >
                #{id}
              </Link>
            ))}
          </div>
        ) : (
          <span className="opacity-50">—</span>
        )}
      </td>
      <td className="py-3 px-2 text-xs opacity-80 align-top">
        {years.length > 0 ? (
          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
            {years.map((y, i) => (
              <span key={`${y}-${i}`} className="whitespace-nowrap">{y}</span>
            ))}
          </div>
        ) : seasonIds.length > 0 ? (
          // fall back to seasons' year when only seasonIds were known
          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
            {seasonIds.map((id) => {
              const y = seasonById.get(id)?.year;
              return y ? (
                <span key={id} className="whitespace-nowrap">{y}</span>
              ) : null;
            })}
          </div>
        ) : (
          <span className="opacity-50">—</span>
        )}
      </td>
    </tr>
  );
}
