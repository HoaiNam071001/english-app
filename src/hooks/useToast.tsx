import { ToastsContext } from "@/contexts/ToastContext";
import { useContext } from "react";

export const useToast = () => {
  const context = useContext(ToastsContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  // Helper functions để gọi nhanh hơn
  const toast = {
    success: (message: string, title?: string) =>
      context.addToast(message, "success", title),
    error: (message: string, title?: string) =>
      context.addToast(message, "error", title),
    info: (message: string, title?: string) =>
      context.addToast(message, "info", title),
    warning: (message: string, title?: string) =>
      context.addToast(message, "warning", title),
    // Gọi tùy chỉnh
    custom: context.addToast,
  };

  return toast;
};
