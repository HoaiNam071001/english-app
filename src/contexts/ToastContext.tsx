import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import React, { createContext, useCallback, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // Thời gian tự tắt (ms)
}

// Định nghĩa dữ liệu mà Context cung cấp
export interface ToastContextType {
  addToast: (
    message: string,
    type?: ToastType,
    title?: string,
    duration?: number
  ) => void;
  removeToast: (id: string) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ToastsContext = createContext<ToastContextType | undefined>(
  undefined
);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Hàm xóa Toast
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Hàm thêm Toast
  const addToast = useCallback(
    (
      message: string,
      type: ToastType = "info",
      title?: string,
      duration: number = 3000
    ) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      // Tự động xóa sau thời gian duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastsContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* --- PHẦN UI HIỂN THỊ TOAST (Nằm đè lên trên cùng) --- */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastsContext.Provider>
  );
};

// --- COMPONENT CON: GIAO DIỆN 1 TOAST ---
export const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({
  toast,
  onClose,
}) => {
  // Cấu hình Icon và Màu sắc dựa trên Type
  const config = {
    success: {
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
    error: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    },
    warning: {
      icon: AlertCircle,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
    },
    info: {
      icon: Info,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      className={`
        pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 animate-in slide-in-from-right-full fade-in
        bg-white ${config.border}
      `}
    >
      <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />

      <div className="flex-1">
        {toast.title && (
          <h4 className={`text-sm font-semibold ${config.color}`}>
            {toast.title}
          </h4>
        )}
        <p className="text-sm text-slate-600 leading-relaxed">
          {toast.message}
        </p>
      </div>

      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};
