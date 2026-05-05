import Link from "next/link";
import { categories, records } from "@/lib/data";
import RecordCard from "@/components/RecordCard";

export default function HomePage() {
  // Featured: most absurd seasons by raw value or asterisk
  const featured = [
    "rush-yds-season-jackson-5277",
    "pass-yds-season-moon-7484",
    "longest-fg-treadwell-72",
    "sacks-season-ball-84",
    "team-det-back-to-back",
  ]
    .map((id) => records.find((r) => r.id === id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  return (
    <div className="space-y-10">
      <section>
        <h1 className="tecmo-headline text-4xl md:text-5xl text-[var(--color-tecmo-gold)] mb-2">
          Tecmo Heroes
        </h1>
        <p className="opacity-80 max-w-2xl">
          Incredible Tecmo Super Bowl records and feats. Each entry shows the
          in-game player on an 8-bit profile card alongside the real NFL face
          who lent the legend.
        </p>
      </section>

      <section>
        <h2 className="tecmo-headline text-2xl mb-4">Categories</h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/records/${c.id}`}
                className="block border-2 border-[var(--color-tecmo-gold)] p-4 hover:bg-white/5"
              >
                <div className="font-bold uppercase text-[var(--color-tecmo-gold)]">
                  {c.label}
                </div>
                <div className="text-xs opacity-80 mt-1">{c.blurb}</div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="tecmo-headline text-2xl mb-4">Featured Records</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {featured.map((r) => (
            <RecordCard key={r.id} record={r} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="tecmo-headline text-2xl mb-4">How records get added</h2>
        <p className="text-sm opacity-80 max-w-2xl">
          This site is a static export. Stats live as JSON in{" "}
          <code className="text-[var(--color-tecmo-gold)]">data/</code>. Use{" "}
          <code className="text-[var(--color-tecmo-gold)]">npm run ingest</code>{" "}
          to add a record interactively — every page (player, category, team,
          season) updates on the next build.
        </p>
      </section>
    </div>
  );
}
