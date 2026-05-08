import Link from "next/link";
import { Helmet } from "@/components/Sprites";

export const metadata = { title: "The Rules — Tecmo Heroes" };

interface TocEntry {
  id: string;
  label: string;
}

const TOC: TocEntry[] = [
  { id: "format", label: "Weekend Format" },
  { id: "book-of-big-red", label: "The Book of Big Red" },
  { id: "scouting", label: "Scouting" },
  { id: "draft-methods", label: "Draft Methods" },
  { id: "tier-list", label: "Tier List" },
  { id: "playbook", label: "Playbook Selection" },
  { id: "tempo", label: "Play Tempo" },
  { id: "lurching", label: "Lurching" },
  { id: "substitutions", label: "Substitutions" },
  { id: "duration", label: "Game Duration" },
  { id: "documentation", label: "Photo Documentation" },
  { id: "meals", label: "Meals" },
];

interface TierRow {
  tier: "S+" | "S" | "A" | "B" | "C" | "D" | "F";
  label: string;
  teams: string[];
  blurb: string;
}

// Tier structure mirrors competitive Tecmo Super Bowl consensus, with the
// S-tier locked in at Oilers / Eagles / Chiefs / Dolphins. Adjust any row
// here if the league agrees on a different read.
const TIER_LIST: TierRow[] = [
  {
    tier: "S+",
    label: "S+ Tier",
    teams: ["SF", "BUF", "GIA", "RAI"],
    blurb: "Complete rosters across all three phases. Always in the championship conversation.",
  },
  {
    tier: "S",
    label: "S Tier",
    teams: ["HOU", "PHI", "KC", "MIA"],
    blurb: "Run-and-shoot weapons and elite skill talent. Elite when healthy but one injury away from a lower tier.",
  },
  {
    tier: "A",
    label: "A Tier",
    teams: ["DET", "CIN", "RAM", "CHI"],
    blurb: "One identifiable franchise piece each — Sanders, Fulcher, Ellard, Samurai Mike — surrounded by serviceable starters.",
  },
  {
    tier: "B",
    label: "B Tier",
    teams: ["MIN", "WAS", "DEN", "TB"],
    blurb: "Each team has some glaring weaknesses but enough weapons to be dangerous. Beatable, on any given Sunday though.",
  },
  {
    tier: "C",
    label: "C Tier",
    teams: ["SD", "JET", "ATL", "PIT"],
    blurb: "Not bad, not great.  MEDIOCRE!",
  },
  {
    tier: "D",
    label: "D Tier",
    teams: ["CLE", "DAL", "PHX", "NO"],
    blurb: "Handicap-pick territory. Win one with these and you have a story for the rest of your life.",
  },
  {
    tier: "F",
    label: "F Tier",
    teams: ["GB", "SEA", "NE", "IND"],
    blurb: "Imagine garbage soaked in three feet of fecal water.  That's this tier.",
  },
];

export default function RulesPage() {
  return (
    <div className="space-y-10 max-w-3xl">
      <header>
        <div className="text-xs uppercase opacity-60">The Rules</div>
        <h1 className="tecmo-headline text-4xl text-[var(--color-tecmo-gold)]">
          The Rules
        </h1>
        <p className="opacity-90 mt-2 text-sm">
          Guidelines for a successful weekend of Tecmo. The league has run on
          this rough framework since the dorm-room revival in 2009. Treat it as
          load-bearing tradition, not a referee&apos;s manual.
        </p>
      </header>

      <nav
        aria-label="Contents"
        className="border-2 border-[var(--color-tecmo-gold)] bg-black/60 p-4"
      >
        <div className="text-[10px] uppercase opacity-70 mb-2">Contents</div>
        <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {TOC.map((t) => (
            <li key={t.id}>
              <a
                href={`#${t.id}`}
                className="hover:text-[var(--color-tecmo-gold)]"
              >
                · {t.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="format" className="scroll-mt-24">
        <h2 className="tecmo-headline text-2xl text-[var(--color-tecmo-gold)] mb-3">
          Weekend Format
        </h2>
        <div className="space-y-3 text-sm leading-relaxed opacity-90">
          <p>
            Tecmo Heroes weekends are structured around playing an entire
            season of Tecmo Super Bowl across two or three calendar days. Every
            team in the matchup is set to <strong>MAN</strong> mode and every
            game between two human players counts toward the standings, the
            statline archive, and the long-running record book.
          </p>
          <p>
            Six players is the soft cap. With more than four, expect to lose
            sleep on Saturday night. The organizer schedules tip-off, makes
            sure stat sheets get filled in, and reads from the Book of Big Red
            before the first kickoff.
          </p>
        </div>
      </section>

      <section id="book-of-big-red" className="scroll-mt-24">
        <h2 className="tecmo-headline text-2xl text-[var(--color-tecmo-gold)] mb-3">
          The Book of Big Red
        </h2>
        <p className="text-sm opacity-90">
          Before the cartridge clicks in, the organizer reads a passage from
          the Book of Big Red — the long-running tribute to Kelly Stouffer and
          early-90s Tecmo lore archived at{" "}
          <a
            className="underline"
            href="http://www.leonardite.com/tecmo/main.html"
          >
            leonardite.com/tecmo
          </a>
          . Treat it like a national anthem. You stand for it, you don&apos;t
          talk over it, and you do not fire up the NES until it&apos;s finished.
        </p>
      </section>

      <section id="scouting" className="scroll-mt-24">
        <h2 className="tecmo-headline text-2xl text-[var(--color-tecmo-gold)] mb-3">
          Scouting
        </h2>
        <p className="text-sm opacity-90">
          Players are expected to review the Paul Schulzetenberg GameFAQ before
          the draft —{" "}
          <a
            className="underline"
            href="https://gamefaqs.gamespot.com/nes/587686-tecmo-super-bowl/faqs/6416"
          >
            the canonical strategy guide
          </a>
          . Once teams are selected, a designated reader walks through each
          drafted roster&apos;s strengths and quirks so everyone in the room
          knows what they are about to face.
        </p>
      </section>

      <section id="draft-methods" className="scroll-mt-24 space-y-3">
        <h2 className="tecmo-headline text-2xl text-[var(--color-tecmo-gold)] mb-1">
          Draft Methods
        </h2>
        <p className="text-sm opacity-90">
          The organizer picks the draft format before the weekend starts. Five
          options have stuck around long enough to count as canon:
        </p>
        <dl className="space-y-3 text-sm">
          <DraftEntry
            title="All Pick"
            body="Least-experienced players select first from the full board. Encourages new players to grab the obvious top-shelf rosters (49ers, Bills, Raiders) without having to muscle their way through a snake."
          />
          <DraftEntry
            title="Equal Pick"
            body="The organizer selects a single tier. Everyone draws randomly from inside that tier — same talent ceiling, different team."
          />
          <DraftEntry
            title="Handicap Pick"
            body="Players are placed into tiers by skill before the draft. Tier differences are settled with point spreads on the scoreboard rather than picking advantages."
          />
          <DraftEntry
            title="Random Pick"
            body="Blind draw from a bag of physical tokens — one per franchise. Drafted teams are pulled out of the bag for the rest of the weekend so every season looks different."
          />
          <DraftEntry
            title="Division Pick"
            body="All players pick out of the same division. Maximizes head-to-head matchups and forces matchup-specific game plans."
          />
        </dl>
      </section>

      <section id="tier-list" className="scroll-mt-24 space-y-3">
        <h2 className="tecmo-headline text-2xl text-[var(--color-tecmo-gold)] mb-1">
          Tier List
        </h2>
        <p className="text-sm opacity-90">
          The tier list drives Equal Pick and Handicap Pick. It is the
          competitive shorthand for who is good and who needs a scoreboard
          spot.
        </p>
        <div className="overflow-x-auto border-2 border-[var(--color-tecmo-gold)] bg-black/60">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-[var(--color-tecmo-gold)]">
                <th className="py-2 px-3 text-[10px] uppercase opacity-70 w-16">Tier</th>
                <th className="py-2 px-3 text-[10px] uppercase opacity-70">Teams</th>
                <th className="py-2 px-3 text-[10px] uppercase opacity-70">Notes</th>
              </tr>
            </thead>
            <tbody>
              {TIER_LIST.map((row) => (
                <tr
                  key={row.tier}
                  className="border-b border-[var(--color-tecmo-gold)]/20 align-top"
                >
                  <td className="py-3 px-3">
                    <span className="tecmo-headline text-lg text-[var(--color-tecmo-gold)]">
                      {row.label}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      {row.teams.map((abbr) => (
                        <Helmet key={abbr} abbr={abbr} size={28} withLabel />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs opacity-80 max-w-md">
                    {row.blurb}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs opacity-60">
          Tiers reflect the league&apos;s working competitive consensus and
          hew closely to the Schulzetenberg guide. They are not gospel — pull a
          C-tier into a Super Bowl and the tier list bends to you.
        </p>
      </section>

      <section id="playbook" className="scroll-mt-24">
        <h2 className="tecmo-headline text-2xl text-[var(--color-tecmo-gold)] mb-3">
          Playbook Selection
        </h2>
        <ul className="text-sm space-y-2 opacity-90">
          <li className="border-l-2 border-[var(--color-tecmo-gold)] pl-3">
            <strong>Initial selection:</strong> 10-minute cap before week 1.
          </li>
          <li className="border-l-2 border-[var(--color-tecmo-gold)] pl-3">
            <strong>Mid-season change:</strong> one allowed between weeks 8 and
            9, with a 5-minute cap.
          </li>
          <li className="border-l-2 border-[var(--color-tecmo-gold)] pl-3">
            <strong>First-time players:</strong> time limits waived; book may
            be re-tuned after weeks 4, 8, 12, and 16.
          </li>
        </ul>
      </section>

      <section id="tempo" className="scroll-mt-24">
        <h2 className="tecmo-headline text-2xl text-[var(--color-tecmo-gold)] mb-3">
          Play Tempo
        </h2>
        <p className="text-sm opacity-90">
          All games run with both teams set to MAN mode. Estimated wall-clock
          time is roughly 20 minutes per matchup. Gameplay is continuous —
          breaks are negotiated, not assumed. Sleep is for the weak.
        </p>
      </section>

      <section id="lurching" className="scroll-mt-24">
        <h2 className="tecmo-headline text-2xl text-[var(--color-tecmo-gold)] mb-3">
          Lurching
        </h2>
        <p className="text-sm opacity-90">
          Lurching — selecting NT or DT and immediately diving on the snap to
          blow up runs at the line — is prohibited in MAN-vs-MAN matches.
          It&apos;s a legal exploit, but the league treats it as bad form.
        </p>
      </section>

      <section id="substitutions" className="scroll-mt-24">
        <h2 className="tecmo-headline text-2xl text-[var(--color-tecmo-gold)] mb-3">
          Substitutions
        </h2>
        <ul className="text-sm space-y-2 opacity-90">
          <li className="border-l-2 border-[var(--color-tecmo-gold)] pl-3">
            <strong>WR at RB is illegal</strong> unless every healthy running
            back has been knocked out by injury.
          </li>
          <li className="border-l-2 border-[var(--color-tecmo-gold)] pl-3">
            <strong>Backup QB and backup RB</strong> may be moved into starting
            slots freely. Game on.
          </li>
        </ul>
      </section>

      <section id="duration" className="scroll-mt-24">
        <h2 className="tecmo-headline text-2xl text-[var(--color-tecmo-gold)] mb-3">
          Game Duration
        </h2>
        <p className="text-sm opacity-90">
          Plan on roughly 20 minutes per game from kickoff through the post-game
          summary. With more than four players you will be hard-pressed to
          finish a full season inside one weekend — the schedule needs to
          account for that up front.
        </p>
      </section>

      <section id="documentation" className="scroll-mt-24">
        <h2 className="tecmo-headline text-2xl text-[var(--color-tecmo-gold)] mb-3">
          Photo Documentation
        </h2>
        <p className="text-sm opacity-90">
          Every game ends with a photograph of the in-game summary screen.
          Those photos are the source of truth for the record book —{" "}
          <Link
            href="/about"
            className="underline hover:text-[var(--color-tecmo-gold)]"
          >
            see the stats methodology
          </Link>{" "}
          for how we work around Tecmo&apos;s in-game maximums.
        </p>
      </section>

      <section id="meals" className="scroll-mt-24">
        <h2 className="tecmo-headline text-2xl text-[var(--color-tecmo-gold)] mb-3">
          Meals
        </h2>
        <p className="text-sm opacity-90">
          Decide who is cooking which meal — or what is being ordered — before
          the weekend starts. Food planning is the difference between a Sunday
          Super Bowl and a Saturday-night meltdown.
        </p>
      </section>

      <p className="text-xs opacity-60 italic">
        Original guidelines authored at{" "}
        <a className="underline" href="https://www.tecmoheroes.com/the-rules">
          tecmoheroes.com/the-rules
        </a>
        . Spread the book of Big Red and the Tecmo gospel.
      </p>
    </div>
  );
}

function DraftEntry({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-l-2 border-[var(--color-tecmo-gold)] pl-3">
      <dt className="font-bold uppercase text-xs text-[var(--color-tecmo-gold)]">
        {title}
      </dt>
      <dd className="opacity-90 mt-1">{body}</dd>
    </div>
  );
}
