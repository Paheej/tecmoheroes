import { notFound } from "next/navigation";
import {
  categories,
  statRecordsByCategoryGroup,
  categoryById,
  SUBCATEGORY_LABEL,
} from "@/lib/data";
import RecordRow from "@/components/RecordRow";
import type { CategoryGroupId, CategoryId, Record } from "@/lib/types";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const meta = categoryById.get(category as CategoryGroupId);
  return { title: meta ? `${meta.label} Records — Tecmo Heroes` : "Tecmo Heroes" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const meta = categoryById.get(category as CategoryGroupId);
  if (!meta) notFound();
  const all = statRecordsByCategoryGroup(meta.id);
  const isTeam = meta.id === "team";

  const grouped: { sub: CategoryId; recs: Record[] }[] = meta.subcategories.map(
    (sub) => ({
      sub,
      recs: all.filter((r) => r.category === sub),
    }),
  );

  const colSpan = isTeam ? 7 : 8;

  return (
    <div className="space-y-8">
      <header>
        <div className="text-xs opacity-60 uppercase">Records</div>
        <h1 className="tecmo-headline text-4xl text-[var(--color-tecmo-gold)]">
          {meta.label}
        </h1>
        <p className="opacity-80 mt-1">{meta.blurb}</p>
      </header>

      {grouped.map(({ sub, recs }) => (
        <section key={sub} className="space-y-3">
          {meta.subcategories.length > 1 && (
            <h2 className="tecmo-headline text-xl text-[var(--color-tecmo-gold)]">
              {SUBCATEGORY_LABEL[sub]}
            </h2>
          )}
          <div className="overflow-x-auto border-2 border-[var(--color-tecmo-gold)] bg-black/60">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-[var(--color-tecmo-gold)]">
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">Scope</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">Record</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">Value</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">Hero</th>
                  {!isTeam && (
                    <th className="py-2 px-2 text-[10px] uppercase opacity-70">Player</th>
                  )}
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">Team</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">Season</th>
                  <th className="py-2 px-2 text-[10px] uppercase opacity-70">Year</th>
                </tr>
              </thead>
              <tbody>
                {recs.map((r) => (
                  <RecordRow key={r.id} record={r} variant={isTeam ? "team" : "default"} />
                ))}
                {recs.length === 0 && (
                  <tr>
                    <td colSpan={colSpan} className="py-8 text-center opacity-60">
                      No records logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
