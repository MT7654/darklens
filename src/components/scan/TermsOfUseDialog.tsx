"use client";

import {
  X,
  AlertTriangle,
  ShieldCheck,
  Scale,
  Cpu,
  UserCheck,
  Camera,
  Lock,
  Globe,
  Network,
  SearchCheck,
  MailQuestion,
  Gavel,
  MapPin,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  TERMS_MODAL,
  TERMS_SECTIONS,
  TERMS_VERSION,
} from "@/lib/constants/terms";
import { setAcceptedTermsVersion } from "@/lib/terms-storage";

type TermsOfUseDialogProps = {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
};

const SECTION_ICONS: LucideIcon[] = [
  FileText,
  Scale,
  Cpu,
  UserCheck,
  Camera,
  Lock,
  Globe,
  Network,
  SearchCheck,
  MailQuestion,
  Gavel,
  MapPin,
];

export function TermsOfUseDialog({
  open,
  onClose,
  onAccept,
}: TermsOfUseDialogProps) {
  const [accepted, setAccepted] = useState(false);
  const checkboxId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setAccepted(false);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  function handleAccept() {
    setAcceptedTermsVersion(TERMS_VERSION);
    onAccept();
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm"
        aria-label="Close terms dialog"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-dialog-title"
        tabIndex={-1}
        className="glass relative z-10 flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border/60 shadow-2xl outline-none"
      >
        {/* Header */}
        <div className="relative flex items-start justify-between gap-4 border-b border-border/50 px-6 py-5">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex items-start gap-3">
            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
              <ShieldCheck className="size-5 text-primary" />
            </div>
            <div>
              <h2
                id="terms-dialog-title"
                className="text-xl font-semibold text-foreground sm:text-2xl"
              >
                {TERMS_MODAL.title}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-secondary">
                {TERMS_MODAL.intro}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="relative inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-secondary transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Warning panel */}
          <section className="mb-6 overflow-hidden rounded-xl border border-warning/40 bg-gradient-to-br from-warning/15 to-warning/5 p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning/20">
                <AlertTriangle className="size-5 text-warning" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {TERMS_MODAL.evidenceNotice.title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-secondary">
                  {TERMS_MODAL.evidenceNotice.body}
                </p>
              </div>
            </div>
          </section>

          {/* Section cards */}
          <div className="grid gap-3 sm:grid-cols-2">
            {TERMS_SECTIONS.map((section, index) => {
              const Icon = SECTION_ICONS[index] ?? FileText;
              return (
                <article
                  key={section.title}
                  className="rounded-xl border border-border/50 bg-background/40 p-4 transition-colors hover:border-border"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="size-4 shrink-0 text-primary" />
                    <h4 className="text-sm font-semibold text-foreground">
                      {section.title}
                    </h4>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-secondary">
                    {section.body}
                  </p>
                </article>
              );
            })}
          </div>

          {/* Acceptance */}
          <section className="mt-6 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="size-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">
                {TERMS_MODAL.acceptance.title}
              </h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-secondary">
              {TERMS_MODAL.acceptance.body}
            </p>

            <label
              htmlFor={checkboxId}
              className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-border/50 bg-background/40 p-3 text-sm leading-6 text-foreground transition-colors hover:border-border"
            >
              <input
                id={checkboxId}
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                className="mt-1 size-4 shrink-0 cursor-pointer rounded border-border accent-primary focus:ring-primary"
              />
              <span>{TERMS_MODAL.acceptance.checkboxLabel}</span>
            </label>
          </section>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-border/50 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-w-36"
          >
            {TERMS_MODAL.acceptance.cancelButton}
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={!accepted}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-on-primary transition-all hover:bg-primary/85 hover:shadow-[0_0_24px_rgba(34,211,238,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none sm:min-w-52"
          >
            {accepted
              ? TERMS_MODAL.acceptance.acceptButton
              : TERMS_MODAL.acceptance.acceptButtonDisabled}
          </button>
        </div>
      </div>
    </div>
  );
}
