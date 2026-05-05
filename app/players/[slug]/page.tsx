import { notFound } from "next/navigation";
import { players, playerBySlug, recordsForPlayer } from "@/lib/data";
import TecmoProfileCard from "@/components/TecmoProfileCard";
import PlayerAvatar from "@/components/PlayerAvatar";
import RecordCard from "@/components/RecordCard";

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
  const recs = recordsForPlayer(player.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <TecmoProfileCard player={player} />
        <div className="flex-1">
          <div className="text-xs uppercase opacity-60">Real player</div>
          <div className="flex items-center gap-4 mt-1">
            <PlayerAvatar
              name={player.realName ?? player.tecmoName}
              avatarSlug={player.avatarSlug}
              size={96}
            />
            <div>
              <h1 className="tecmo-headline text-3xl text-[var(--color-tecmo-gold)]">
                {player.realName ?? player.tecmoName}
              </h1>
              <div className="text-sm opacity-80 mt-1">
                In-game: <span className="font-bold">{player.tecmoName}</span>
                {player.position && ` · ${player.position}`}
                {player.team && ` · ${player.team}`}
              </div>
              {player.bio && <p className="mt-3 text-sm opacity-90 max-w-prose">{player.bio}</p>}
            </div>
          </div>
        </div>
      </div>

      <section>
        <h2 className="tecmo-headline text-xl mb-3">
          Records held ({recs.length})
        </h2>
        {recs.length === 0 ? (
          <p className="opacity-60 text-sm">No records logged for this player.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recs.map((r) => (
              <RecordCard key={r.id} record={r} showFullProfile={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
