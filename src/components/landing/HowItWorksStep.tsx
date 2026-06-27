type HowItWorksStepProps = {
  step: number;
  title: string;
  description: string;
};

export function HowItWorksStep({
  step,
  title,
  description,
}: HowItWorksStepProps) {
  return (
    <article className="glass relative flex gap-4 rounded-2xl border border-border/60 p-5">
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-bold text-primary ring-1 ring-primary/20"
        aria-hidden="true"
      >
        {step}
      </div>
      <div className="space-y-1.5 pb-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-6 text-secondary">{description}</p>
      </div>
    </article>
  );
}
