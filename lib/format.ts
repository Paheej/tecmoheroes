import type { Scope } from "./types";

export const scopeLabel: Record<Scope, string> = {
  "single-play": "Single Play",
  "single-game": "Single Game",
  season: "Season",
  career: "Career",
  playoff: "Playoff",
  "super-bowl": "Super Bowl",
};

export function initials(name: string): string {
  const cleaned = name.replace(/[()*]/g, "").trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function formatValue(value: number | string, unit?: string): string {
  const v = typeof value === "number" ? value.toLocaleString() : value;
  return unit ? `${v} ${unit}` : v;
}
