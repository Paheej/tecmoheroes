"use client";

import { useEffect, useState } from "react";
import type { Record } from "@/lib/types";
import RecordCard from "./RecordCard";

interface Props {
  pool: Record[];
  count?: number;
}

export default function FeaturedRandomRecords({ pool, count = 6 }: Props) {
  const [picks, setPicks] = useState<Record[] | null>(null);

  useEffect(() => {
    setPicks(sample(pool, count));
  }, [pool, count]);

  // Pick a deterministic placeholder for the first server render so hydration
  // doesn't flash empty space.
  const display = picks ?? pool.slice(0, count);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {display.map((r) => (
        <RecordCard key={r.id} record={r} />
      ))}
    </div>
  );
}

function sample<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return [...arr];
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, n);
}
