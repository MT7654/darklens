import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`glass rounded-2xl border border-border/60 p-6 ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }: CardProps) {
  return <div className={`mb-4 space-y-1.5 ${className}`} {...props} />;
}

export function CardTitle({
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-lg font-semibold tracking-tight text-foreground ${className}`}
      {...props}
    />
  );
}

export function CardDescription({
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-sm leading-6 text-secondary ${className}`}
      {...props}
    />
  );
}

export function CardContent({ className = "", ...props }: CardProps) {
  return <div className={`${className}`} {...props} />;
}
