"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";

/*
 * One toast host for the whole app, mounted by AppLayout. Every module calls
 * the same `useToast()` hook so confirmation copy and placement stay identical
 * across Inventory, Suppliers and Production — no toast library required.
 */

const TOAST_DURATION = 3500;

export type ToastTone = "success" | "critical" | "info";

interface ToastRecord {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be called inside a <ToastProvider>.");
  }

  return context;
}

const toneStyles: Record<
  ToastTone,
  { rail: string; icon: string; Icon: ComponentType<{ className?: string }> }
> = {
  success: {
    rail: "bg-positive",
    icon: "text-positive",
    Icon: CheckCircle2,
  },
  critical: {
    rail: "bg-critical",
    icon: "text-critical",
    Icon: CircleAlert,
  },
  info: {
    rail: "bg-brand",
    icon: "text-brand",
    Icon: Info,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timers = useRef(new Map<number, number>());
  const lastId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));

    const timer = timers.current.get(id);

    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      // A counter, not Date.now() — two toasts in the same millisecond would
      // otherwise collide on key and the second would never render.
      lastId.current += 1;
      const id = lastId.current;

      setToasts((current) => [...current, { id, message, tone }]);

      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), TOAST_DURATION)
      );
    },
    [dismiss]
  );

  useEffect(() => {
    const pending = timers.current;

    return () => {
      pending.forEach((timer) => window.clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed right-4 bottom-4 z-[200] flex w-[min(23rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {toasts.map((item) => {
          const { rail, icon, Icon } = toneStyles[item.tone];

          return (
            <div
              key={item.id}
              className="animate-rise pointer-events-auto relative flex items-start gap-2.5 overflow-hidden rounded-md border border-line bg-panel py-3 pr-2.5 pl-4 shadow-overlay"
            >
              {/* Same 2px rail the sidebar uses for the active route. */}
              <span
                aria-hidden="true"
                className={cn("absolute inset-y-0 left-0 w-[2px]", rail)}
              />

              <Icon className={cn("mt-px size-4 shrink-0", icon)} />

              <p className="flex-1 text-sm leading-snug text-ink">
                {item.message}
              </p>

              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Dismiss notification"
                className="-mt-0.5 -mr-0.5 flex size-6 shrink-0 items-center justify-center rounded-sm text-ink-faint transition-colors hover:bg-panel-sunken hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
