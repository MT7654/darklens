import {
  ArrowLeft,
  AlertCircle,
  ShieldAlert,
  Camera,
  Info,
  Sparkles,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { DetectionGroup } from "@/components/scan/DetectionGroup";
import { RiskGauge } from "@/components/scan/RiskGauge";
import { ScreenshotRescanForm } from "@/components/scan/ScreenshotRescanForm";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/Card";
import {
  REPORT_DISCLAIMER,
  REPORT_FOOTER_DISCLAIMER,
} from "@/lib/constants/disclaimers";
import {
  buildSafeSummary,
  CUE_EDUCATION,
  NEXT_STEPS,
} from "@/lib/constants/wording";
import { formatDateTimeSGT } from "@/lib/date";
import { isAccessBlockedScan, isUserScreenshotScan } from "@/lib/page-access";
import type { ScanWithDetections } from "@/types/scan";

type ScanReportProps = {
  scan: ScanWithDetections;
};

function groupDetections(scan: ScanWithDetections) {
  const groups = new Map<string, ScanWithDetections["detections"]>();
  for (const detection of scan.detections) {
    const existing = groups.get(detection.category) ?? [];
    existing.push(detection);
    groups.set(detection.category, existing);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

function getTechnicalSignals(scan: ScanWithDetections) {
  const signals: string[] = [];
  const usesHttps = scan.normalizedUrl.startsWith("https://");
  const accessBlocked = isAccessBlockedScan(scan);
  signals.push(usesHttps ? "HTTPS present" : "HTTPS not used on submitted URL");
  if (accessBlocked) {
    signals.push("Page access blocked — automated scan could not load full content");
  }
  if (isUserScreenshotScan(scan)) {
    signals.push("Analysis based on user-provided screenshot");
  }
  if (scan.finalUrl && scan.finalUrl !== scan.normalizedUrl) {
    signals.push("Redirect detected to a different final URL");
  }
  signals.push("Unable to assess reputation from this scan alone");
  return signals;
}

function getPressureDetections(scan: ScanWithDetections) {
  return scan.detections.filter(
    (detection) => detection.patternType !== "PageAccessBlocked",
  );
}

export function ScanReport({ scan }: ScanReportProps) {
  const accessBlocked = isAccessBlockedScan(scan);
  const pressureDetections = getPressureDetections(scan);
  const grouped = groupDetections({ ...scan, detections: pressureDetections });
  const scannedAt = formatDateTimeSGT(scan.completedAt ?? scan.createdAt);
  const safeSummary = accessBlocked
    ? (scan.summary ?? buildSafeSummary(0))
    : buildSafeSummary(pressureDetections.length);
  const technicalSignals = getTechnicalSignals(scan);
  const accessDetection = scan.detections.find(
    (detection) => detection.patternType === "PageAccessBlocked",
  );

  return (
    <div className="min-h-screen pb-24">
      {/* Top header bar */}
      <div className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="space-y-1">
            <Link
              href="/"
              className="inline-flex cursor-pointer items-center gap-2 text-sm text-primary transition-colors hover:text-primary/80"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to home
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Scan report
            </h1>
            <p
              className="max-w-2xl break-all text-xs text-secondary"
              title={scan.url}
            >
              {scan.url}
            </p>
            <p className="text-xs text-secondary">Scanned on {scannedAt}</p>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-secondary">
                Caution Level
              </p>
              <p className="text-2xl font-bold text-foreground">
                {scan.riskScore ?? 0}
                <span className="text-sm font-normal text-secondary">/100</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Split-pane layout: screenshot left, analysis right */}
      <div className="grid gap-0 px-4 sm:px-6 lg:grid-cols-[3fr_2fr] lg:gap-6 lg:px-8">
        {/* LEFT: Live website preview (sticky) */}
        <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:self-start">
          <div className="glass flex h-full flex-col overflow-hidden rounded-2xl border border-border/60">
            {/* Browser chrome header */}
            <div className="flex items-center gap-2 border-b border-border/40 bg-muted/30 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="size-3 rounded-full bg-red-500/60" />
                <span className="size-3 rounded-full bg-yellow-500/60" />
                <span className="size-3 rounded-full bg-green-500/60" />
              </div>
              <div className="ml-2 flex flex-1 items-center gap-2 truncate rounded-md border border-border/40 bg-background/60 px-3 py-1.5">
                <Camera className="size-3.5 shrink-0 text-secondary" />
                <span className="truncate text-xs text-secondary">
                  {scan.finalUrl ?? scan.url}
                </span>
                <a
                  href={scan.finalUrl ?? scan.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto shrink-0 text-secondary hover:text-primary"
                  aria-label="Open live site"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>

            {/* Screenshot / preview area */}
            <div className="flex flex-1 items-center justify-start overflow-auto bg-muted/20 p-3">
              {scan.viewportScreenshot ? (
                // biome-ignore lint/performance/noImgElement: base64 evidence snapshot from scan
                <img
                  src={`data:image/jpeg;base64,${scan.viewportScreenshot}`}
                  alt="Viewport screenshot captured during scan"
                  className="w-full rounded-lg border border-border/40 object-top"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <Camera className="size-10 text-secondary/40" />
                  <p className="max-w-xs text-sm text-secondary">
                    {accessBlocked
                      ? "No screenshot captured — the page blocked automated access."
                      : "No screenshot available for this scan."}
                  </p>
                  {accessBlocked ? (
                    <ScreenshotRescanForm url={scan.url} />
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Analysis feed (scrollable) */}
        <div className="space-y-6 py-4">
          {/* Disclaimer banner */}
          <div
            role="note"
            className="glass rounded-2xl border border-border/60 p-4 text-sm leading-6 text-secondary"
          >
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 size-4 shrink-0 text-primary/60" />
              <div>
                <p>{REPORT_DISCLAIMER}</p>
                <p className="mt-2">{REPORT_FOOTER_DISCLAIMER}</p>
              </div>
            </div>
          </div>

          {accessBlocked ? (
            <div
              role="alert"
              className="glass rounded-2xl border border-warning/30 bg-warning/5 p-5 text-sm leading-6"
            >
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning" />
                <div>
                  <p className="font-semibold text-foreground">
                    Scan could not access full page content
                  </p>
                  <p className="mt-2 text-secondary">
                    {scan.summary ??
                      "The website blocked or limited automated access. Countdown timers, scarcity messages, and other design cues visible in a normal browser may not appear in this report."}
                  </p>
                  {accessDetection ? (
                    <p className="mt-2 text-secondary">
                      Evidence: {accessDetection.evidence}
                    </p>
                  ) : null}
                  <div className="mt-4">
                    <ScreenshotRescanForm url={scan.url} />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {isUserScreenshotScan(scan) ? (
            <div
              role="note"
              className="glass rounded-2xl border border-border/60 p-4 text-sm leading-6 text-secondary"
            >
              <div className="flex items-start gap-3">
                <Camera className="mt-0.5 size-4 shrink-0 text-primary/60" />
                <p>
                  This report was generated from a screenshot you uploaded.
                  DarkLens did not request the live webpage again for this
                  analysis.
                </p>
              </div>
            </div>
          ) : null}

          {/* Summary card */}
          <Card className="glass">
            <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
              <CardTitle className="text-xl font-bold">
                {scan.pageTitle ?? "Analysis summary"}
              </CardTitle>
              <CardDescription className="font-medium text-foreground/80">
                {safeSummary}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {scan.summary ? (
                <p className="text-sm leading-7 text-secondary">{scan.summary}</p>
              ) : (
                <p className="text-sm italic text-secondary">
                  No additional summary available.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Pressure cues / detection feed */}
          {grouped.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-border/60 pb-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                  <AlertCircle className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    Detected pressure cues
                  </h2>
                  <p className="text-sm text-secondary">
                    {pressureDetections.length} finding
                    {pressureDetections.length === 1 ? "" : "s"} — sorted by
                    severity
                  </p>
                </div>
              </div>
              {grouped.map(([category, detections]) => (
                <DetectionGroup
                  key={category}
                  category={category}
                  detections={detections}
                />
              ))}
            </div>
          ) : (
            <Card className="glass flex flex-col items-center gap-4 py-14 text-center">
              <CheckCircle2 className="size-12 text-success/60" />
              <h2 className="text-xl font-semibold text-foreground">
                {accessBlocked
                  ? "Insufficient evidence from this scan"
                  : "No pressure cues detected"}
              </h2>
              <p className="mx-auto max-w-prose text-sm leading-6 text-secondary">
                {accessBlocked
                  ? "Because the page could not be fully loaded, we cannot confirm whether pressure cues are present. Open the site in your own browser and review what you see before deciding."
                  : "We did not find strong evidence of urgency, scarcity, or checkout pressure cues on this page. Consider checking independently before deciding."}
              </p>
            </Card>
          )}

          {/* Technical signals */}
          <Card className="glass">
            <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="size-2 rounded-full bg-primary" />
                Technical signals
              </CardTitle>
              <CardDescription>
                Neutral observations from this scan.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3">
                {technicalSignals.map((signal) => (
                  <li
                    key={signal}
                    className="flex items-start gap-3 text-sm text-secondary"
                  >
                    <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/40" />
                    <span className="leading-relaxed">{signal}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* What this means */}
          <Card className="glass flex flex-col">
            <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" />
                What this means
              </CardTitle>
              <CardDescription>
                Context for common design cues.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid max-h-[400px] flex-1 gap-4 overflow-y-auto p-6 sm:grid-cols-2">
              {CUE_EDUCATION.map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-border/40 bg-background/40 p-4 transition-colors hover:border-primary/30 hover:bg-muted/10"
                >
                  <h3 className="text-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-secondary">
                    {item.body}
                  </p>
                </article>
              ))}
            </CardContent>
          </Card>

          {/* Next steps */}
          <Card className="glass">
            <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
              <CardTitle className="text-base">What you can do next</CardTitle>
              <CardDescription>
                Practical steps to reduce reliance on a single scan result.
              </CardDescription>
            </CardHeader>
            <ul className="space-y-3 px-6 pb-6 pt-2">
              {NEXT_STEPS.map((step) => (
                <li
                  key={step}
                  className="flex items-start gap-3 text-sm leading-6 text-secondary"
                >
                  <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/40" />
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Mobile: scan another URL bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-border/60 bg-background/95 p-4 backdrop-blur lg:hidden">
        <Link
          href="/"
          className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-on-primary transition-colors hover:bg-primary/90"
        >
          Scan another URL
        </Link>
      </div>
    </div>
  );
}
