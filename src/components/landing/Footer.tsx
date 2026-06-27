import Link from "next/link";
import { ScanSearch } from "lucide-react";

const footerLinks = [
  { href: "#", label: "About" },
  { href: "#disclaimer", label: "Disclaimer" },
  {
    href: "mailto:review@darklens.example?subject=DarkLens%20review%20request",
    label: "Request review",
  },
  { href: "#", label: "Contact" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                <ScanSearch className="size-4 text-primary" />
              </span>
              <p className="text-base font-semibold text-foreground">
                Dark<span className="gradient-text">Lens</span>
              </p>
            </div>
            <p className="max-w-sm text-sm leading-6 text-secondary">
              Consumer decision-support for online trust.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-8 border-t border-border/50 pt-6 text-xs leading-5 text-secondary">
          DarkLens highlights observable design cues. It is not a substitute for
          legal, financial, or security advice.
        </p>
      </div>
    </footer>
  );
}
