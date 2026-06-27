import { ShieldCheck, Lock, Eye } from "lucide-react";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: "shield" | "lock" | "eye";
};

const iconMap = {
  shield: ShieldCheck,
  lock: Lock,
  eye: Eye,
} as const;

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  const Icon = iconMap[icon];
  return (
    <article className="glass card-hover rounded-2xl border border-border/60 p-6">
      <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="size-5 text-primary" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-secondary">{description}</p>
    </article>
  );
}
