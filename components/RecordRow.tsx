import Link from "next/link";
import type { Record } from "@/lib/types";
import { playerById, userById } from "@/lib/data";
import { formatValue, scopeLabel } from "@/lib/format";
import PlayerAvatar from "./PlayerAvatar";

interface Props {
  record: Record;
}

export default function RecordRow({ record }: Props) {
  const players = record.tecmoPlayerIds
    .map((id) => playerById.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const users = record.userIds
    .map((id) => userById.get(id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

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
      <td className="py-3 px-2 align-top">
        <div className="flex items-center gap-2 flex-wrap">
          {players.map((p) => (
            <Link
              key={p.id}
              href={`/players/${p.slug}`}
              className="flex items-center gap-1.5 hover:text-[var(--color-tecmo-gold)]"
              title={p.realName ?? p.tecmoName}
            >
              <PlayerAvatar
                name={p.realName ?? p.tecmoName}
                avatarSlug={p.avatarSlug}
                size={28}
              />
              <span className="text-xs">{p.tecmoName}</span>
            </Link>
          ))}
        </div>
      </td>
      <td className="py-3 px-2 text-xs align-top whitespace-nowrap">
        {users.map((u) => u.displayName).join(", ")}
      </td>
      <td className="py-3 px-2 text-xs opacity-80 align-top">
        {record.teamAbbrs.join(", ")}
      </td>
      <td className="py-3 px-2 text-xs opacity-70 align-top whitespace-nowrap">
        {record.dateAchieved ?? "—"}
      </td>
    </tr>
  );
}
