import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  label?: string;
}

function getDisplayLabel(score: number) {
  if (score >= 75) return "Très fort";
  if (score >= 50) return "Fort";
  if (score >= 25) return "Moyen";
  return "Faible";
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const tone =
    score >= 75
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
      : score >= 50
        ? "border-sky-400/30 bg-sky-400/10 text-sky-200"
        : score >= 25
          ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
          : "border-rose-400/30 bg-rose-400/10 text-rose-200";

  const displayLabel = getDisplayLabel(score);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        tone,
      )}
    >
      <span>{score}/100</span>
      <span className="opacity-70">-</span>
      <span>{displayLabel}</span>
    </span>
  );
}