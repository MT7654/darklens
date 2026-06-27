import { Clock, PackageOpen, Users, ShoppingCart, Repeat, CalendarClock } from "lucide-react";

type CheckCategoryCardProps = {
  title: string;
  description: string;
  icon: "urgency" | "scarcity" | "social" | "checkout" | "subscription" | "consistency";
};

const iconMap = {
  urgency: Clock,
  scarcity: PackageOpen,
  social: Users,
  checkout: ShoppingCart,
  subscription: Repeat,
  consistency: CalendarClock,
} as const;

export function CheckCategoryCard({
  title,
  description,
  icon,
}: CheckCategoryCardProps) {
  const Icon = iconMap[icon];
  return (
    <article className="glass card-hover rounded-2xl border border-border/60 p-5">
      <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-4.5 text-primary" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-secondary">{description}</p>
    </article>
  );
}
