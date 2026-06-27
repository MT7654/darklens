"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, ShieldOff, Camera } from "lucide-react";

type LiveSitePreviewProps = {
  url: string;
  frameable: boolean;
  screenshotBase64: string | null;
  accessBlocked?: boolean;
  rescanForm?: React.ReactNode;
};

export function LiveSitePreview({
  url,
  frameable,
  screenshotBase64,
  accessBlocked,
  rescanForm,
}: LiveSitePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!frameable) return;
    const timer = setTimeout(() => {
      if (!loadedRef.current) {
        setTimedOut(true);
        setLoading(false);
      }
    }, 12_000);
    return () => clearTimeout(timer);
  }, [frameable]);

  // Primary: ALWAYS show the captured snapshot at full visible size.
  // The iframe is a secondary overlay that the user can opt into.
  return (
    <div className="flex h-full flex-col bg-background/40">
      {/* Mode toggle header */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/40 bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Camera className="size-3.5 shrink-0 text-primary/60" />
          <span className="text-xs font-medium text-secondary">
            {frameable ? "Live site available" : "Live site blocked"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5 text-xs font-medium text-secondary hover:border-primary/50 hover:text-primary"
            title="Open in new tab"
          >
            <ExternalLink className="size-3.5" />
            <span className="hidden sm:inline">Open</span>
          </a>
        </div>
      </div>

      {/* Snapshot display — fills the entire viewport, no zoom */}
      <div className="flex flex-1 items-start justify-start overflow-auto bg-background/40 p-4">
        {screenshotBase64 ? (
          // biome-ignore lint/performance/noImgElement: base64 evidence snapshot
          <img
            src={`data:image/jpeg;base64,${screenshotBase64}`}
            alt="Captured snapshot of the scanned page"
            className="block h-auto w-full rounded-lg border border-border/40"
            style={{ imageRendering: "auto" }}
          />
        ) : (
          <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center gap-4 p-8 text-center">
            {accessBlocked ? (
              <>
                <ShieldOff className="size-12 text-warning/60" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Page blocked automated access
                  </p>
                  <p className="mt-2 max-w-sm text-sm text-secondary">
                    We couldn&apos;t load this page automatically. Upload a
                    screenshot from your own browser to analyse it without
                    another automated fetch.
                  </p>
                </div>
                {rescanForm}
              </>
            ) : (
              <>
                <Camera className="size-12 text-secondary/40" />
                <p className="max-w-xs text-sm text-secondary">
                  No snapshot available for this scan.
                </p>
              </>
            )}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary/90"
            >
              <ExternalLink className="size-4" />
              Open in new tab
            </a>
          </div>
        )}
      </div>

      {/* Live iframe — layered behind, user can opt into live view */}
      {frameable && screenshotBase64 && (
        <details className="shrink-0 border-t border-border/40 bg-muted/20">
          <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-xs font-medium text-secondary hover:text-foreground">
            <Loader2 className="size-3.5" />
            <span>Try loading live site in embedded view</span>
            {timedOut && <span className="text-warning/80">(timed out)</span>}
          </summary>
          <div className="relative h-[400px] w-full bg-background/40">
            {loading && !timedOut && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
                <Loader2 className="size-6 animate-spin text-primary/60" />
              </div>
            )}
            <iframe
              src={url}
              title="Live website preview"
              className="h-full w-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              referrerPolicy="no-referrer"
              onLoad={() => {
                loadedRef.current = true;
                setLoading(false);
              }}
            />
          </div>
        </details>
      )}
    </div>
  );
}