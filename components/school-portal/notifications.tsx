"use client";

import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ToastTone = "success" | "error" | "info" | "warning";
type Toast = { id: number; title: string; message?: string; tone: ToastTone };
type ConfirmOptions = { title: string; message: string; confirmLabel?: string; cancelLabel?: string; tone?: "default" | "danger"; inputLabel?: string; inputPlaceholder?: string };
type ConfirmState = ConfirmOptions & { resolve: (value: boolean | string | null) => void };

const NotificationContext = createContext<{
  toast: (title: string, options?: { message?: string; tone?: ToastTone }) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: ConfirmOptions & { inputLabel: string }) => Promise<string | null>;
} | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<ConfirmState | null>(null);
  const [input, setInput] = useState("");

  const toast = useCallback((title: string, options?: { message?: string; tone?: ToastTone }) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, title, message: options?.message, tone: options?.tone ?? "info" }]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 4200);
  }, []);

  const request = useCallback((options: ConfirmOptions) => new Promise<boolean | string | null>((resolve) => {
    setInput("");
    setDialog({ ...options, resolve });
  }), []);
  const confirm = useCallback((options: ConfirmOptions) => request(options).then(Boolean), [request]);
  const prompt = useCallback((options: ConfirmOptions & { inputLabel: string }) => request(options).then((value) => typeof value === "string" ? value : null), [request]);
  const value = useMemo(() => ({ toast, confirm, prompt }), [toast, confirm, prompt]);

  const close = (result: boolean | string | null) => {
    dialog?.resolve(result);
    setDialog(null);
  };

  const icons = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };

  return <NotificationContext.Provider value={value}>
    {children}
    <div className="pointer-events-none fixed right-3 top-3 z-[200] flex w-[calc(100%-1.5rem)] max-w-sm flex-col gap-2 sm:right-5 sm:top-5">
      <AnimatePresence>
        {toasts.map((item) => { const Icon = icons[item.tone]; return <motion.div key={item.id} initial={{ opacity: 0, x: 40, scale: .96 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 30, scale: .96 }} className={`pointer-events-auto border-2 border-zinc-900 bg-white p-4 shadow-[4px_4px_0_#18181b] ${item.tone === "error" ? "border-l-8 border-l-red-600" : item.tone === "success" ? "border-l-8 border-l-emerald-600" : item.tone === "warning" ? "border-l-8 border-l-amber-500" : "border-l-8 border-l-blue-600"}`}>
          <div className="flex gap-3"><Icon className="mt-0.5 h-5 w-5 shrink-0" /><div className="min-w-0 flex-1"><p className="text-xs font-black uppercase tracking-wide">{item.title}</p>{item.message && <p className="mt-1 text-xs text-zinc-600">{item.message}</p>}</div><button type="button" onClick={() => setToasts((current) => current.filter((toast) => toast.id !== item.id))}><X className="h-4 w-4" /></button></div>
        </motion.div>; })}
      </AnimatePresence>
    </div>
    <AnimatePresence>
      {dialog && <motion.div className="fixed inset-0 z-[190] flex items-center justify-center bg-zinc-950/65 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={() => close(null)}>
        <motion.div role="alertdialog" aria-modal="true" aria-labelledby="portal-dialog-title" initial={{ opacity: 0, y: 20, scale: .95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: .96 }} transition={{ type: "spring", stiffness: 360, damping: 28 }} onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-md border-4 border-zinc-900 bg-white p-5 shadow-[7px_7px_0_#18181b]">
          <div className="flex items-start gap-3"><div className={`p-2 ${dialog.tone === "danger" ? "bg-red-100 text-red-700" : "bg-yellow-400 text-zinc-900"}`}><AlertTriangle className="h-5 w-5" /></div><div><h2 id="portal-dialog-title" className="text-lg font-black uppercase">{dialog.title}</h2><p className="mt-1 text-sm text-zinc-600">{dialog.message}</p></div></div>
          {dialog.inputLabel && <label className="mt-5 block"><span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-zinc-500">{dialog.inputLabel}</span><textarea autoFocus value={input} onChange={(event) => setInput(event.target.value)} placeholder={dialog.inputPlaceholder} rows={3} className="w-full border-2 border-zinc-900 p-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400" /></label>}
          <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => close(null)} className="border-2 border-zinc-900 bg-white px-4 py-2 text-xs font-black uppercase">{dialog.cancelLabel ?? "Cancel"}</button><button type="button" disabled={Boolean(dialog.inputLabel && !input.trim())} onClick={() => close(dialog.inputLabel ? input.trim() : true)} className={`border-2 border-zinc-900 px-4 py-2 text-xs font-black uppercase text-white disabled:opacity-40 ${dialog.tone === "danger" ? "bg-red-600" : "bg-zinc-900"}`}>{dialog.confirmLabel ?? "Confirm"}</button></div>
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  </NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used inside NotificationProvider");
  return context;
}
