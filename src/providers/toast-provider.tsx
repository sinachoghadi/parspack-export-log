"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastType = "success" | "error" | "info";

type ToastInput = {
  message: string;
  type: ToastType;
};

type ToastItem = ToastInput & {
  id: number;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastType, string> = {
  success: "border-success/20 bg-success-soft text-success",
  error: "border-danger/20 bg-danger-soft text-danger",
  info: "border-accent/20 bg-accent-soft text-accent",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(1);
  const timersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timersRef.current.get(id);

    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = nextIdRef.current;
      nextIdRef.current += 1;
      setToasts((current) => [...current.slice(-2), { ...input, id }]);

      const timer = setTimeout(
        () => dismiss(id),
        input.type === "error" ? 5_000 : 3_500,
      );
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      for (const timer of timersRef.current.values()) {
        clearTimeout(timer);
      }
    },
    [],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[70] flex flex-col items-center gap-2 sm:left-auto sm:right-5 sm:w-96 sm:items-stretch"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex w-full items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-sm shadow-[0_16px_45px_rgba(24,24,27,0.14)] ${toneStyles[item.type]}`}
            role={item.type === "error" ? "alert" : "status"}
          >
            <span
              aria-hidden="true"
              className="mt-1.5 size-2 shrink-0 rounded-full bg-current"
            />
            <p className="min-w-0 flex-1 leading-5 text-foreground">
              {item.message}
            </p>
            <button
              aria-label="Dismiss notification"
              className="-mr-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-current outline-none hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-current"
              type="button"
              onClick={() => dismiss(item.id)}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
