import type { ComponentProps } from "react";

type SkeletonProps = ComponentProps<"div">;

export function Skeleton({
  "aria-hidden": ariaHidden = true,
  className = "",
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden={ariaHidden}
      className={`animate-pulse rounded-[var(--radius-sm)] bg-border/70 motion-reduce:animate-none ${className}`}
      {...props}
    />
  );
}
