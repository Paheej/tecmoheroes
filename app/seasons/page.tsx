import Link from "next/link";
import {
  seasons,
  statRecordsForSeason,
  userById,
} from "@/lib/data";
import { Helmet } from "@/components/Sprites";

export const metadata = { title: "Seasons — Tecmo Heroes" };

export default function SeasonsIndex() {
  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase opacity-60">Seasons</div>
        <h1 className="tecmo-headline text-4xl text-[var(--color-tecmo-gold)]">
          Season Index
        </h1>
      </header>

      <div className="border-2 border-[var(--color-tecmo-gold)] bg-black/60 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-[var(--color-tecmo-gold)]">
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">Season</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">Year</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">SB Champion (Hero)</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">SB Champion (Team)</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">Score</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">Runner-up (Team)</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">Runner-up (Hero)</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">Records</th>
            </tr>
          </thead>
          <tbody>
            {seasons.map((s) => {
              const recs = statRecordsForSeason(s.id);
              const sb = s.superBowl;
              const champUser = sb?.championUser
                ? userById.get(sb.championUser)
                : null;
              const ruUser = sb?.runnerUpUser
                ? userById.get(sb.runnerUpUser)
                : null;
              return (
                <tr
                  key={s.id}
                  className="border-b border-[var(--color-tecmo-gold)]/20 hover:bg-white/5"
                >
                  <td className="py-2 px-2 font-bold">
                    <Link
                      href={`/seasons/${s.id}`}
                      className="hover:text-[var(--color-tecmo-gold)]"
                    >
                      #{s.id}
                    </Link>
                  </td>
                  <td className="py-2 px-2">{s.year}</td>
                  <td className="py-2 px-2 text-xs">
                    {champUser ? (
                      <Link
                        href={`/heroes/${champUser.slug}`}
                        className="hover:text-[var(--color-tecmo-gold)]"
                      >
                        {champUser.shortName ?? champUser.displayName}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2 px-2">
                    {sb?.champion ? (
                      <Helmet abbr={sb.champion} size={20} withLabel />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2 px-2 text-xs opacity-90 whitespace-nowrap">
                    {sb ? `${sb.championScore} — ${sb.runnerUpScore}` : "—"}
                  </td>
                  <td className="py-2 px-2">
                    {sb?.runnerUp ? (
                      <Helmet abbr={sb.runnerUp} size={20} withLabel />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2 px-2 text-xs">
                    {ruUser ? (
                      <Link
                        href={`/heroes/${ruUser.slug}`}
                        className="hover:text-[var(--color-tecmo-gold)]"
                      >
                        {ruUser.shortName ?? ruUser.displayName}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2 px-2">{recs.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
