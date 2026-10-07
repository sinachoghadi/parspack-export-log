import { forwardRef, type ComponentProps } from "react";

type IconButtonProps = Omit<ComponentProps<"button">, "aria-label"> & {
  "aria-label": string;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { className = "", type = "button", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground shadow-sm transition-colors outline-none hover:bg-surface-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-surface disabled:hover:text-muted-foreground ${className}`}
        {...props}
      />
    );
  },
);
