import Link from "next/link";
import { users, recordsForUser } from "@/lib/data";

export const metadata = { title: "Users — Tecmo Heroes" };

export default function UsersIndex() {
  const sorted = [...users].sort((a, b) => {
    const ra = recordsForUser(a.id).length;
    const rb = recordsForUser(b.id).length;
    if (rb !== ra) return rb - ra;
    return a.displayName.localeCompare(b.displayName);
  });

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase opacity-60">Users</div>
        <h1 className="tecmo-headline text-4xl text-[var(--color-tecmo-gold)]">
          The Players (humans)
        </h1>
      </header>

      <ul className="grid gap-3 md:grid-cols-2">
        {sorted.map((u) => {
          const count = recordsForUser(u.id).length;
          return (
            <li key={u.id}>
              <Link
                href={`/users/${u.slug}`}
                className="block border-2 border-[var(--color-tecmo-gold)] p-3 hover:bg-white/5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase">{u.displayName}</span>
                  <span className="text-xs text-[var(--color-tecmo-gold)]">
                    {count} record{count === 1 ? "" : "s"}
                  </span>
                </div>
                {u.bio && <p className="text-xs opacity-80 mt-1">{u.bio}</p>}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
