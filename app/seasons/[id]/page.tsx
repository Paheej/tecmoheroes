import { notFound } from "next/navigation";
import { seasons, seasonById, recordsForSeason } from "@/lib/data";
import RecordCard from "@/components/RecordCard";

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
  const recs = recordsForSeason(season.id);

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase opacity-60">Season</div>
        <h1 className="tecmo-headline text-4xl text-[var(--color-tecmo-gold)]">
          Season {season.id} · {season.year}
        </h1>
        {season.championTeam && (
          <div className="mt-2 text-sm">
            Champion: <span className="font-bold">{season.championTeam}</span>
          </div>
        )}
        {season.notes && <p className="mt-2 opacity-80">{season.notes}</p>}
      </header>

      {recs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {recs.map((r) => (
            <RecordCard key={r.id} record={r} />
          ))}
        </div>
      ) : (
        <p className="opacity-60 text-sm">No records logged for this season yet.</p>
      )}
    </div>
  );
}
