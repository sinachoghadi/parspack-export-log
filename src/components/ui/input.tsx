import type { ComponentProps } from "react";

type InputProps = ComponentProps<"input">;

export function Input({ className = "", type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={`h-10 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-muted-foreground disabled:opacity-70 ${className}`}
      {...props}
    />
  );
}
