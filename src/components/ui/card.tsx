import type { ComponentProps } from "react";

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-border bg-surface ${className}`}
      {...props}
    />
  );
}

export function CardHeader({
  className = "",
  ...props
}: ComponentProps<"div">) {
  return <div className={`p-5 pb-3 sm:p-6 sm:pb-3 ${className}`} {...props} />;
}

export function CardTitle({
  className = "",
  ...props
}: ComponentProps<"h2">) {
  return (
    <h2
      className={`text-base font-semibold tracking-tight text-foreground ${className}`}
      {...props}
    />
  );
}

export function CardDescription({
  className = "",
  ...props
}: ComponentProps<"p">) {
  return (
    <p
      className={`mt-1 text-sm leading-6 text-muted-foreground ${className}`}
      {...props}
    />
  );
}

export function CardContent({
  className = "",
  ...props
}: ComponentProps<"div">) {
  return <div className={`p-5 pt-2 sm:p-6 sm:pt-3 ${className}`} {...props} />;
}
