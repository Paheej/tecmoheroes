import Link from "next/link";
import { seasons, recordsForSeason } from "@/lib/data";

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

      <div className="border-2 border-[var(--color-tecmo-gold)] bg-black/60">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-[var(--color-tecmo-gold)]">
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">Season</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">Year</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">Champion</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">Records logged</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">Notes</th>
            </tr>
          </thead>
          <tbody>
            {seasons.map((s) => (
              <tr key={s.id} className="border-b border-[var(--color-tecmo-gold)]/20 hover:bg-white/5">
                <td className="py-2 px-2 font-bold">
                  <Link href={`/seasons/${s.id}`} className="hover:text-[var(--color-tecmo-gold)]">
                    #{s.id}
                  </Link>
                </td>
                <td className="py-2 px-2">{s.year}</td>
                <td className="py-2 px-2">{s.championTeam ?? "—"}</td>
                <td className="py-2 px-2">{recordsForSeason(s.id).length}</td>
                <td className="py-2 px-2 text-xs opacity-80">{s.notes ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
