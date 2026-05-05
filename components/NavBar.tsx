import Link from "next/link";
import { categories } from "@/lib/data";

const links = [
  { href: "/", label: "Home" },
  ...categories.map((c) => ({ href: `/records/${c.id}`, label: c.label })),
  { href: "/players", label: "Players" },
  { href: "/seasons", label: "Seasons" },
  { href: "/about", label: "About" },
];

export default function NavBar() {
  return (
    <nav className="border-b-4 border-[var(--color-tecmo-gold)] bg-black/60 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link
          href="/"
          className="text-[var(--color-tecmo-gold)] tecmo-headline text-xl shrink-0"
        >
          ▶ TECMO HEROES
        </Link>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm uppercase">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="hover:text-[var(--color-tecmo-gold)] hover:underline underline-offset-4"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
