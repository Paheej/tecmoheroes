import Link from "next/link";
import { STAT_MAX } from "@/lib/types";

export const metadata = { title: "About — Tecmo Heroes" };

export default function AboutPage() {
  return (
    <div className="space-y-12 max-w-3xl">
      <header>
        <h1 className="tecmo-headline text-4xl text-[var(--color-tecmo-gold)] mb-4">
          About
        </h1>
        <p className="opacity-90">
          Tecmo Heroes is a website dedicated to archiving our records on the
          hands down greatest sports game of all time —{" "}
          <em>Tecmo Super Bowl</em>. Built in the spirit of{" "}
          <a className="underline" href="https://tecmogeek.com">
            tecmogeek.com
          </a>
          , seeded from the records originally archived at{" "}
          <a className="underline" href="https://tecmoheroes.com">
            tecmoheroes.com
          </a>
          .
        </p>
        <p className="opacity-80 mt-3 text-sm italic">
          All records here are multi-MAN seasons. No solo-season records are
          recorded.
        </p>
      </header>

      <section>
        <h2 className="tecmo-headline text-2xl text-[var(--color-tecmo-gold)] mb-3">
          The Story
        </h2>
        <div className="space-y-3 text-sm leading-relaxed opacity-90">
          <p>
            It all started when a local neighborhood teenager introduced PJ to
            the game <em>Tecmo Super Bowl</em> in 1992 in Biloxi, Mississippi.
            After a few painful early defeats, he found his footing with the
            San Francisco 49ers and never looked back.
          </p>
          <p>
            A copy arrived in 1995 and the next five years were spent grinding
            seasons. College put the cartridge to bed for a while, until 2009 —
            when PJ brought the original Nintendo Entertainment System to his
            dorm and reintroduced the game to a new audience.
          </p>
          <p>
            That dorm crew became the league. We&apos;ve been recording season
            stats every season since, keeping track of records, Super Bowls,
            and MVPs. Hardware stayed Nintendo-based until the planned
            migration to AVS in 2023.
          </p>
        </div>
      </section>

      <section>
        <h2 className="tecmo-headline text-2xl text-[var(--color-tecmo-gold)] mb-3">
          The Rules
        </h2>
        <p className="text-sm opacity-90">
          Guidelines for a successful weekend of Tecmo, draft methods, the
          tier list, and play-tempo conventions all live on a dedicated page —{" "}
          <Link
            href="/rules"
            className="underline text-[var(--color-tecmo-gold)]"
          >
            see The Rules
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className="tecmo-headline text-2xl text-[var(--color-tecmo-gold)] mb-3">
          The Stats
        </h2>
        <div className="space-y-3 text-sm opacity-90">
          <p>
            After every season — or between the regular season and the Super
            Bowl — we record the stats of most of the leaders on each team. The
            raw numbers live in a Google Sheet; this site is generated from a
            snapshot of that workbook.
          </p>
          <p>
            In cases where a value exceeds the in-game maximum (single-season
            rushing or passing TDs, for instance), the figure is either
            captured after every game or determined mathematically. Example: add
            up all receiver touchdowns on a team, subtract the backup QB&apos;s
            thrown touchdowns, and you have a derived total for the starter.
          </p>
        </div>

        <h3 className="tecmo-headline text-base mt-5 mb-2">Stat Maximums</h3>
        <ul className="text-sm space-y-1">
          <li>
            Passing yards:{" "}
            <strong>{STAT_MAX.passingYardsSeason.toLocaleString()}</strong>
          </li>
          <li>
            Rushing / Receiving / Return yards:{" "}
            <strong>{STAT_MAX.rushingYardsSeason.toLocaleString()}</strong>
          </li>
          <li>
            Passing / Rushing / Receiving TDs:{" "}
            <strong>{STAT_MAX.passingTDsSeason}</strong>
          </li>
          <li>
            Rush Attempts (single season):{" "}
            <strong>{STAT_MAX.rushingAttemptsSeason}</strong>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="tecmo-headline text-2xl text-[var(--color-tecmo-gold)] mb-3">
          Record Format
        </h2>
        <p className="text-sm opacity-90">
          In general each record is presented as:{" "}
          <code className="text-[var(--color-tecmo-gold)]">
            Tecmo Player, ### Statistic, Team, Player, Season (Year)
          </code>
          . The Tecmo profile card shows the in-game name; the round avatar
          shows the real NFL face that lent the legend.
        </p>
      </section>

      <section>
        <h2 className="tecmo-headline text-2xl text-[var(--color-tecmo-gold)] mb-3">
          Adding Records
        </h2>
        <p className="text-sm opacity-90">
          The data lives as JSON in <code>data/</code>, regenerated from{" "}
          <code>Tecmo Statistics Current.xlsx</code> via{" "}
          <code>python3 scripts/convert-xlsx.py</code>. For one-off entries,{" "}
          <code>npm run ingest</code> walks you through a new record
          interactively, and <code>npm run ingest:rebuild</code> chains a
          static export afterward.
        </p>
      </section>
    </div>
  );
}
