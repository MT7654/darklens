"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, ShieldOff } from "lucide-react";

type LiveSitePreviewProps = {
  url: string;
  frameable: boolean;
  screenshotBase64: string | null;
};

export function LiveSitePreview({
  url,
  frameable,
  screenshotBase64,
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

  // Not frameable: show stored screenshot fallback
  if (!frameable) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-border/40 bg-warning/5 px-4 py-2.5">
          <ShieldOff className="size-4 shrink-0 text-warning" />
          <p className="text-xs text-secondary">
            This site blocks live embedding — showing captured snapshot
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center overflow-auto bg-background/40 p-4">
          {screenshotBase64 ? (
            // biome-ignore lint/performance/noImgElement: base64 evidence snapshot
            <img
              src={`data:image/jpeg;base64,${screenshotBase64}`}
              alt="Captured snapshot of the scanned page"
              className="max-h-full w-full rounded-lg border border-border/40 object-contain object-left-top"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <ShieldOff className="size-10 text-secondary/40" />
              <p className="max-w-xs text-sm text-secondary">
                No snapshot available and this site blocks live embedding.
              </p>
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
      </div>
    );
  }

  // Frameable: show live iframe
  return (
    <div className="relative h-full w-full bg-background/40">
      {loading && !timedOut && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/60">
          <Loader2 className="size-8 animate-spin text-primary/60" />
          <p className="text-sm text-secondary">Loading live website…</p>
        </div>
      )}
      {timedOut && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-background/80 p-6 text-center">
          <ShieldOff className="size-10 text-warning/60" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Taking too long to load
            </p>
            <p className="mt-1 max-w-xs text-sm text-secondary">
              The site may be slow or blocking embedded previews.
            </p>
          </div>
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
  );
}
