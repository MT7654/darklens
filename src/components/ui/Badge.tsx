import type { HTMLAttributes } from "react";
import type { DetectionSeverity } from "@/types/scan";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "destructive";
};

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-muted/80 text-secondary border-border",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
};

export function Badge({
  variant = "default",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export function severityToBadgeVariant(
  severity: DetectionSeverity,
): NonNullable<BadgeProps["variant"]> {
  switch (severity) {
    case "HIGH":
      return "destructive";
    case "MEDIUM":
      return "warning";
    case "LOW":
      return "success";
    default: {
      const _exhaustive: never = severity;
      return _exhaustive;
    }
  }
}

export function riskScoreToLabel(score: number): string {
  if (score === 0) return "Insufficient evidence";
  if (score <= 5) return "No major concerns detected";
  if (score < 40) return "Some caution";
  if (score < 70) return "Moderate caution";
  return "High caution";
}

export function riskScoreToBadgeVariant(
  score: number,
): NonNullable<BadgeProps["variant"]> {
  if (score === 0) return "default";
  if (score >= 70) return "destructive";
  if (score >= 40) return "warning";
  return "success";
}
