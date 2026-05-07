import Link from "next/link";
import { categories, seasons, statRecords } from "@/lib/data";
import FeaturedRandomRecords from "@/components/FeaturedRandomRecords";
import SuperBowlPanel from "@/components/SuperBowlPanel";

export default function HomePage() {
  const latestSb = [...seasons]
    .filter((s) => s.superBowl)
    .sort((a, b) => b.id - a.id)[0];

  return (
    <div className="space-y-10">
      <section>
        <h1 className="tecmo-headline text-4xl md:text-5xl text-[var(--color-tecmo-gold)] mb-2">
          Tecmo Heroes
        </h1>
        <p className="opacity-80 max-w-2xl">
          Incredible Tecmo Super Bowl records and feats. Each entry shows the
          in-game player on an 8-bit profile card alongside the real NFL face
          who lent the legend, plus the league hero who set it.
        </p>
      </section>

      <section>
        <h2 className="tecmo-headline text-2xl mb-3">The League</h2>
        <p className="text-sm opacity-90 max-w-2xl">
          Started in 1992 in Biloxi, MS. Reignited in a college dorm in 2009.
          Twenty seasons of multi-MAN Tecmo Super Bowl, recorded one box score
          at a time. See <Link href="/about" className="underline text-[var(--color-tecmo-gold)]">the story</Link>{" "}
          for the long version, or jump straight to the <Link href="/heroes" className="underline text-[var(--color-tecmo-gold)]">heroes</Link>.
        </p>
      </section>

      {latestSb?.superBowl && (
        <section>
          <h2 className="tecmo-headline text-2xl mb-3">
            Most Recent Super Bowl
          </h2>
          <SuperBowlPanel
            game={latestSb.superBowl}
            seasonId={latestSb.id}
            linkToSeason
          />
        </section>
      )}

      <section>
        <h2 className="tecmo-headline text-2xl mb-4">Featured Records</h2>
        <p className="text-xs opacity-60 mb-3">
          Six records, freshly shuffled every visit.
        </p>
        <FeaturedRandomRecords pool={statRecords} count={6} />
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
    </div>
  );
}
