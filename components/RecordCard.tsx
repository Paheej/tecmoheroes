import Link from "next/link";
import type { Record } from "@/lib/types";
import { playerById, userById, teamByAbbr } from "@/lib/data";
import { scopeLabel, formatValue } from "@/lib/format";
import TecmoProfileCard from "./TecmoProfileCard";
import PlayerAvatar from "./PlayerAvatar";

interface Props {
  record: Record;
  showFullProfile?: boolean;
}

export default function RecordCard({ record, showFullProfile = true }: Props) {
  const players = record.tecmoPlayerIds
    .map((id) => playerById.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const users = record.userIds
    .map((id) => userById.get(id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));
  const teams = record.teamAbbrs.map((a) => teamByAbbr.get(a)).filter(Boolean);

  return (
    <article className="border-2 border-[var(--color-tecmo-gold)] bg-black/70 p-4">
      <header className="flex items-baseline justify-between gap-3 border-b border-[var(--color-tecmo-gold)]/40 pb-2 mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest opacity-70">
            {scopeLabel[record.scope]}
          </div>
          <h3 className={`text-lg font-bold uppercase ${record.asterisk ? "tecmo-asterisk" : ""}`}>
            {record.statName}
          </h3>
        </div>
        <div className="text-3xl font-black text-[var(--color-tecmo-gold)] tecmo-headline">
          {formatValue(record.value, record.unit)}
        </div>
      </header>

      {showFullProfile && players.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-3">
          {players.map((p) => (
            <div key={p.id} className="flex items-start gap-3">
              <Link href={`/players/${p.slug}`}>
                <TecmoProfileCard player={p} compact />
              </Link>
              <div className="flex flex-col items-center gap-1 mt-2">
                <PlayerAvatar
                  name={p.realName ?? p.tecmoName}
                  avatarSlug={p.avatarSlug}
                  size={56}
                />
                <span className="text-[10px] opacity-70 max-w-[80px] text-center">
                  {p.realName ?? "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        {users.length > 0 && (
          <span>
            <span className="opacity-60 uppercase">User:</span>{" "}
            {users.map((u, i) => (
              <span key={u.id}>
                <Link
                  href={`/users/${u.slug}`}
                  className="font-bold hover:text-[var(--color-tecmo-gold)] underline-offset-4"
                >
                  {u.displayName}
                </Link>
                {i < users.length - 1 ? ", " : ""}
              </span>
            ))}
          </span>
        )}
        {teams.length > 0 && (
          <span>
            <span className="opacity-60 uppercase">Team:</span>{" "}
            {teams.map((t) => t!.displayName).join(", ")}
          </span>
        )}
        {record.dateAchieved && (
          <span>
            <span className="opacity-60 uppercase">Set:</span> {record.dateAchieved}
          </span>
        )}
      </footer>

      {record.notes && (
        <p className="mt-2 text-xs italic opacity-75">{record.notes}</p>
      )}
    </article>
  );
}
