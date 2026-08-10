// src/components/Toast.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-xl transition-all duration-300 animate-slide-up ${
              toast.type === 'success'
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900 shadow-emerald-100/50'
                : toast.type === 'error'
                ? 'bg-rose-50/90 border-rose-200 text-rose-900 shadow-rose-100/50'
                : 'bg-stone-900/90 border-stone-800 text-white shadow-stone-900/20'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
              {toast.type === 'error' && <AlertCircle size={16} className="text-rose-500 shrink-0" />}
              {toast.type === 'info' && <Info size={16} className="text-rose-400 shrink-0" />}
              <span className="text-xs font-mono font-medium leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-600 transition-colors p-1"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if rendered outside provider
    return { showToast: (msg) => console.log('Toast:', msg) };
  }
  return ctx;
}
