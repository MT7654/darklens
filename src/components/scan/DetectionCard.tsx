import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  confidenceLabelFromScore,
  suggestedActionForCategory,
} from "@/lib/constants/wording";
import type { ScanWithDetections } from "@/types/scan";

type DetectionCardProps = {
  detection: ScanWithDetections["detections"][number];
};

function formatCategoryLabel(category: string): string {
  return category.replaceAll("_", " ").toLowerCase();
}

const severityConfig = {
  HIGH: {
    icon: AlertTriangle,
    border: "border-destructive/60 border-l-4",
    glow: "shadow-[0_0_24px_-4px_rgba(155,28,28,0.35)]",
    bg: "bg-destructive/5",
    text: "text-destructive",
    label: "High",
  },
  MEDIUM: {
    icon: AlertCircle,
    border: "border-border/60 border-l-4 border-l-warning",
    glow: "",
    bg: "bg-warning/5",
    text: "text-warning",
    label: "Medium",
  },
  LOW: {
    icon: Info,
    border: "border-border/60 border-l-4 border-l-success",
    glow: "",
    bg: "bg-success/5",
    text: "text-success",
    label: "Low",
  },
} as const;

export function DetectionCard({ detection }: DetectionCardProps) {
  const confidenceLabel = confidenceLabelFromScore(detection.confidence);
  const suggestedAction = suggestedActionForCategory(detection.category);
  const sev = severityConfig[detection.severity] ?? severityConfig.LOW;
  const SevIcon = sev.icon;

  return (
    <Card className={`glass card-hover border ${sev.border} ${sev.glow} ${sev.bg}`}>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize text-foreground">
            {formatCategoryLabel(detection.category)}
          </span>
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium ${sev.text}`}>
            <SevIcon className="size-3" />
            {sev.label} concern
          </span>
          <span className="inline-flex rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-secondary">
            Confidence: {confidenceLabel}
          </span>
        </div>
        <CardTitle className="mt-2 text-base text-foreground">
          {detection.patternType.replaceAll(/([A-Z])/g, " $1").trim()}
        </CardTitle>
      </CardHeader>
      <blockquote className="mb-4 border-l-2 border-primary/30 pl-4 text-sm italic text-secondary">
        "{detection.evidence}"
      </blockquote>
      <div className="space-y-3 px-6 pb-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-secondary">
            Why it matters
          </p>
          <p className="mt-1 text-sm leading-6 text-secondary">
            {detection.description}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-secondary">
            Suggested action
          </p>
          <p className="mt-1 text-sm leading-6 text-primary/90">
            {suggestedAction}
          </p>
        </div>
      </div>
    </Card>
  );
}
