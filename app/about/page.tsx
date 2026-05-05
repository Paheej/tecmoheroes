import { STAT_MAX } from "@/lib/types";

export const metadata = { title: "About — Tecmo Heroes" };

export default function AboutPage() {
  return (
    <div className="prose prose-invert max-w-3xl">
      <h1 className="tecmo-headline text-4xl text-[var(--color-tecmo-gold)] mb-4">
        About
      </h1>
      <p>
        Tecmo Heroes is an archive of incredible records and feats from{" "}
        <em>Tecmo Super Bowl</em> league play. It is built in the spirit of{" "}
        <a className="underline" href="https://tecmogeek.com">tecmogeek.com</a>{" "}
        and seeded from the records archived at{" "}
        <a className="underline" href="https://tecmoheroes.com">tecmoheroes.com</a>.
      </p>

      <h2 className="tecmo-headline text-xl mt-8 mb-2">Record Format</h2>
      <p className="text-sm">
        <code>Tecmo Player, ### and Statistic, Team, User, Season (Year)</code>.
        Each record links to the in-game player profile and the real NFL face.
      </p>

      <h2 className="tecmo-headline text-xl mt-8 mb-2">Stat Maximums</h2>
      <p className="text-sm">
        Some single-season stats exceed Tecmo Super Bowl's hard caps. Where that
        happens, the value is derived (game-by-game running totals or by summing
        receiver stats and subtracting the backup QB's contribution). Caps:
      </p>
      <ul className="text-sm">
        <li>Passing yards: <strong>{STAT_MAX.passingYardsSeason.toLocaleString()}</strong></li>
        <li>Rushing / Receiving / Return yards: <strong>{STAT_MAX.rushingYardsSeason.toLocaleString()}</strong></li>
        <li>Passing / Rushing / Receiving TDs: <strong>{STAT_MAX.passingTDsSeason}</strong></li>
        <li>Rush Attempts (single season): <strong>{STAT_MAX.rushingAttemptsSeason}</strong></li>
      </ul>

      <h2 className="tecmo-headline text-xl mt-8 mb-2">Adding Records</h2>
      <p className="text-sm">
        From the repo root: <code>npm run ingest</code> walks you through a new
        record interactively, validates the value against the stat caps, and
        writes it to <code>data/records.json</code>. Use{" "}
        <code>npm run ingest:rebuild</code> to chain a static export afterward.
      </p>
    </div>
  );
}
