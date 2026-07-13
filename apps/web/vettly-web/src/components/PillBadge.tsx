import type { Tone } from "../utils/tones";

export function PillBadge({ tone, label }: Readonly<{ tone: Tone; label: string }>) {
  return (
    <span
      className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap"
      style={{ color: tone.color, background: tone.bg }}
    >
      {label}
    </span>
  );
}
