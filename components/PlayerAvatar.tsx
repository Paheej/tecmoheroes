import { initials } from "@/lib/format";
import { existsSync } from "node:fs";
import path from "node:path";

interface Props {
  name: string;
  avatarSlug?: string | null;
  size?: number;
  className?: string;
}

const PALETTE = [
  "#ef4444", "#f59e0b", "#10b981", "#3b82f6",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
];

function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length]!;
}

export default function PlayerAvatar({
  name,
  avatarSlug,
  size = 64,
  className = "",
}: Props) {
  const file = avatarSlug
    ? path.join(process.cwd(), "public", "avatars", `${avatarSlug}.png`)
    : null;
  const hasImage = file ? existsSync(file) : false;

  if (hasImage) {
    return (
      // Static export: <img> avoids the Next/Image runtime; file in public/.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/avatars/${avatarSlug}.png`}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover border-2 border-black ${className}`}
      />
    );
  }

  return (
    <div
      title={`Headshot placeholder — drop public/avatars/${avatarSlug}.png to replace`}
      className={`rounded-full flex items-center justify-center font-bold border-2 border-black select-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, ${colorFor(name)}, #111)`,
        fontSize: size * 0.38,
        color: "#fff",
        textShadow: "1px 1px 0 #000",
      }}
    >
      {initials(name)}
    </div>
  );
}
