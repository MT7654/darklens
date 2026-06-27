import { ScanSearch, Zap, PackageOpen, Users, ShoppingCart, Repeat, CalendarClock, ShieldCheck, Lock, Eye, Clock } from "lucide-react";
import { CheckCategoryCard } from "@/components/landing/CheckCategoryCard";
import { DisclaimerBlock } from "@/components/landing/DisclaimerBlock";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { HeroUrlScanner } from "@/components/landing/HeroUrlScanner";
import { HowItWorksStep } from "@/components/landing/HowItWorksStep";
import { SampleReportCard } from "@/components/landing/SampleReportCard";
import { PRIVATE_REPOSITORY_NOTE } from "@/lib/constants/disclaimers";

const trustHighlights = [
  {
    title: "Evidence-based",
    description:
      "Findings are linked to visible page text, UI elements, or screenshot evidence.",
    icon: "shield" as const,
  },
  {
    title: "Private by default",
    description:
      "Screenshots are used internally to improve consistency checks.",
    icon: "lock" as const,
  },
  {
    title: "Built for caution",
    description: "Reports avoid accusations and use confidence levels.",
    icon: "eye" as const,
  },
] as const;

const howItWorksSteps = [
  {
    title: "Paste a link",
    description:
      "Submit a public shopping, booking, subscription, donation, or checkout page.",
  },
  {
    title: "We scan the page",
    description:
      "DarkLens captures visible text, layout signals, screenshots, and selected page metadata.",
  },
  {
    title: "We identify design cues",
    description:
      "The tool checks for urgency, scarcity, social proof, pricing, consent, and subscription-related cues.",
  },
  {
    title: "You review the evidence",
    description:
      "Each finding includes a plain-English explanation and suggested next step.",
  },
] as const;

const checkCategories = [
  {
    title: "Urgency cues",
    description: "Countdown timers, flash sale claims, offer expiry messages.",
    icon: "urgency" as const,
  },
  {
    title: "Scarcity cues",
    description: "Low-stock messages, 'only X left', limited quantity claims.",
    icon: "scarcity" as const,
  },
  {
    title: "Social proof cues",
    description: "Visitor counts, recent purchase popups, popularity claims.",
    icon: "social" as const,
  },
  {
    title: "Checkout fairness",
    description: "Preselected add-ons, late fees, unclear final pricing.",
    icon: "checkout" as const,
  },
  {
    title: "Subscription friction",
    description:
      "Auto-renewal terms, cancellation difficulty, free-trial conversion.",
    icon: "subscription" as const,
  },
  {
    title: "Consistency over time",
    description:
      "Repeated scans can show whether time-limited claims keep reappearing.",
    icon: "consistency" as const,
  },
] as const;

const historyMiniCards = [
  { title: "First observed", value: "12 Mar 2026" },
  { title: "Last observed", value: "27 Jun 2026" },
  { title: "Repeated claim detected", value: "'Sale ends today'" },
] as const;

export function LandingPageContent() {
  return (
    <>
      <section className="hero-radial relative border-b border-border/50 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-primary/5 px-4 py-1.5 text-sm text-secondary">
              <ScanSearch className="size-4 text-primary" />
              AI-powered dark pattern detection
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl">
              Spot pressure tactics
              <br />
              <span className="gradient-text">before you decide</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-secondary">
              DarkLens scans a webpage for potential urgency, scarcity, pricing,
              and checkout design cues, then explains the evidence in plain
              English.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-2xl">
            <HeroUrlScanner />
          </div>
        </div>
      </section>

      <section className="border-b border-border/50 bg-muted/20 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {trustHighlights.map((item) => (
              <FeatureCard
                key={item.title}
                title={item.title}
                description={item.description}
                icon={item.icon}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-24 border-b border-border/50 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How it works
            </h2>
            <p className="mt-3 text-sm leading-6 text-secondary">
              A simple process designed to help you slow down and review what
              you see on a page.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {howItWorksSteps.map((step, index) => (
              <HowItWorksStep
                key={step.title}
                step={index + 1}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="what-we-check"
        className="scroll-mt-24 border-b border-border/50 bg-muted/20 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              What we check
            </h2>
            <p className="mt-3 text-sm leading-6 text-secondary">
              Design cue detected — not a verdict. Each category reflects
              observable signals that may encourage faster decision-making.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {checkCategories.map((category) => (
              <CheckCategoryCard
                key={category.title}
                title={category.title}
                description={category.description}
                icon={category.icon}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="sample-report"
        className="scroll-mt-24 border-b border-border/50 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <SampleReportCard />
          </div>
        </div>
      </section>

      <section className="border-b border-border/50 bg-muted/20 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              More than a one-time warning
            </h2>
            <p className="mt-4 text-sm leading-7 text-secondary">
              Some claims cannot be assessed from a single visit. DarkLens can
              privately compare repeated scans to see whether countdowns, sale
              labels, stock claims, or visitor counts appear consistently over
              time.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {historyMiniCards.map((card) => (
              <article
                key={card.title}
                className="glass card-hover rounded-2xl border border-border/60 p-5"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-secondary">
                  {card.title}
                </p>
                <p className="mt-2 text-sm font-semibold text-primary">
                  {card.value}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-6 max-w-3xl text-sm leading-6 text-secondary">
            {PRIVATE_REPOSITORY_NOTE}
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <DisclaimerBlock />
        </div>
      </section>
    </>
  );
}
