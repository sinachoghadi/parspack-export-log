import type { ComponentProps } from "react";

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "accent";

type BadgeProps = ComponentProps<"span"> & {
  variant?: BadgeVariant;
};

const variantStyles: Record<BadgeVariant, string> = {
  neutral: "bg-surface-secondary text-muted-foreground",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  accent: "bg-accent-soft text-accent",
};

export function Badge({
  className = "",
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex min-h-6 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}
