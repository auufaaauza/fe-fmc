"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Toast = { id: number; title: string; description?: string; type?: "success" | "error" };
type ToastContextValue = { toast: (toast: Omit<Toast, "id">) => void };

const ToastContext = createContext<ToastContextValue | null>(null);
let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo(
    () => ({
      toast: (toast: Omit<Toast, "id">) => {
        const id = ++toastId;
        setToasts((current) => [...current, { ...toast, id }]);
        window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 3200);
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[80] w-[calc(100%-2rem)] max-w-sm space-y-3 sm:w-auto">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "nb-card w-full p-4 sm:w-80",
              toast.type === "error" ? "border-red-200 bg-red-50/80" : "bg-white/70"
            )}
          >
            <div className="font-semibold text-slate-900">{toast.title}</div>
            {toast.description ? <div className="mt-1 text-sm text-slate-600">{toast.description}</div> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function Toaster() {
  return null;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast harus dipakai di dalam ToastProvider.");
  }
  return context;
}
