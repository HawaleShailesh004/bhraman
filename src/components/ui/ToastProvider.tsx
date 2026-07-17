"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Toast } from "@/components/ui/Toast";

type ToastPayload = {
  title: string;
  description: string;
  tone?: "ok" | "err";
};

type ToastState = ToastPayload & { id: number };

const ToastContext = createContext<{
  pushToast: (toast: ToastPayload) => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const pushToast = useCallback((payload: ToastPayload) => {
    const id = Date.now();
    setToast({ ...payload, id, tone: payload.tone ?? "ok" });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-[min(360px,calc(100vw-2rem))] flex-col gap-2 sm:bottom-auto sm:top-20"
        aria-live="polite"
      >
        <Toast
          open={Boolean(toast)}
          title={toast?.title ?? ""}
          description={toast?.description ?? ""}
          tone={toast?.tone ?? "ok"}
        />
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
