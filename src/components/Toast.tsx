"use client";
import { createContext, useContext, useState, useCallback, useEffect } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration: number;
}

const ToastContext = createContext<{ toast: (msg: string, type?: "success" | "error" | "info", duration?: number) => void }>({ toast: () => {} });

export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: Toast["type"] = "success", duration = 3000) => {
    const id = `t_${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const colors = {
    success: "border-emerald/30 bg-emerald/10 text-emerald",
    error: "border-red/30 bg-red/10 text-red-400",
    info: "border-gold/30 bg-gold/10 text-gold",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm font-medium backdrop-blur-sm shadow-lg animate-[slideIn_0.2s_ease-out] ${colors[t.type]}`}>
            {t.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </ToastContext.Provider>
  );
}