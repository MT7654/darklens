import {
  Badge,
  riskScoreToBadgeVariant,
  riskScoreToLabel,
} from "@/components/ui/Badge";

type RiskGaugeProps = {
  score: number;
};

export function RiskGauge({ score }: RiskGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const strokeClass =
    clamped >= 70
      ? "text-destructive"
      : clamped >= 40
        ? "text-warning"
        : "text-success";

  const glowColor =
    clamped >= 70
      ? "rgba(239, 68, 68, 0.35)"
      : clamped >= 40
        ? "rgba(245, 158, 11, 0.35)"
        : "rgba(16, 185, 129, 0.35)";

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div
        className="relative size-44"
        style={{ filter: `drop-shadow(0 0 16px ${glowColor})` }}
      >
        <svg
          viewBox="0 0 128 128"
          className="size-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-border"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`transition-all duration-500 ease-out motion-reduce:transition-none ${strokeClass}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tabular-nums text-foreground">
            {clamped}
          </span>
          <span className="mt-0.5 text-xs uppercase tracking-wider text-secondary">
            Caution level
          </span>
        </div>
      </div>
      <Badge variant={riskScoreToBadgeVariant(clamped)} className="px-4 py-1.5 text-sm">
        {riskScoreToLabel(clamped)}
      </Badge>
    </div>
  );
}
