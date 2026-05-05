import { notFound } from "next/navigation";
import { categories, recordsByCategory, categoryById } from "@/lib/data";
import RecordRow from "@/components/RecordRow";
import type { CategoryId } from "@/lib/types";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const meta = categoryById.get(category as CategoryId);
  return { title: meta ? `${meta.label} Records — Tecmo Heroes` : "Tecmo Heroes" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const meta = categoryById.get(category as CategoryId);
  if (!meta) notFound();
  const recs = recordsByCategory(meta.id);

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs opacity-60 uppercase">Records</div>
        <h1 className="tecmo-headline text-4xl text-[var(--color-tecmo-gold)]">
          {meta.label}
        </h1>
        <p className="opacity-80 mt-1">{meta.blurb}</p>
      </header>

      <div className="overflow-x-auto border-2 border-[var(--color-tecmo-gold)] bg-black/60">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-[var(--color-tecmo-gold)]">
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">Scope</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">Record</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">Value</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">Player</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">User</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">Team</th>
              <th className="py-2 px-2 text-[10px] uppercase opacity-70">Set</th>
            </tr>
          </thead>
          <tbody>
            {recs.map((r) => (
              <RecordRow key={r.id} record={r} />
            ))}
            {recs.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center opacity-60">
                  No records logged yet — be the first.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
