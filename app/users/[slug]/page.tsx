import { notFound } from "next/navigation";
import { users, userBySlug, recordsForUser } from "@/lib/data";
import RecordCard from "@/components/RecordCard";

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

export default async function UserPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = userBySlug.get(slug);
  if (!user) notFound();
  const recs = recordsForUser(user.id);

  const stats: [string, string | number | undefined][] = [
    ["Age", user.age],
    ["Height", user.height],
    ["Ethnicity", user.ethnicity],
    ["Team", user.team],
    ["From", user.from],
    ["Currently", user.currentResidence],
    ["Seasons", user.seasonsPlayed],
    ["SB Appearances", user.sbAppearances],
    ["SB Championships", user.sbChampionships],
    ["Records", user.recordsCount],
  ];

  return (
    <div className="space-y-8">
      <header>
        <div className="text-xs uppercase opacity-60">User</div>
        <h1 className="tecmo-headline text-4xl text-[var(--color-tecmo-gold)]">
          {user.displayName}
        </h1>
        {user.bio && <p className="opacity-80 mt-2 max-w-prose">{user.bio}</p>}
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

      <section>
        <h2 className="tecmo-headline text-xl mb-3">
          Records held ({recs.length})
        </h2>
        {recs.length === 0 ? (
          <p className="opacity-60 text-sm">No records logged for this user.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recs.map((r) => (
              <RecordCard key={r.id} record={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
