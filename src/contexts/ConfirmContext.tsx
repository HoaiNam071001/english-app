import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react"; // Icon cảnh báo
import React, { createContext, ReactNode, useCallback, useState } from "react";

// 1. Định nghĩa các tùy chọn hiển thị
export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive"; // Màu nút confirm (Xanh/Đỏ)
}

export interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ConfirmContext = createContext<ConfirmContextType | undefined>(
  undefined
);

// 2. Provider
export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    message: "",
    title: "Xác nhận",
    confirmText: "Đồng ý",
    cancelText: "Hủy",
    variant: "default",
  });

  // Lưu giữ hàm resolve của Promise để gọi sau khi user bấm nút
  const [resolveCallback, setResolveCallback] = useState<
    (value: boolean) => void | null
  >(() => null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setOptions({
        title: "Xác nhận",
        confirmText: "Đồng ý",
        cancelText: "Hủy",
        variant: "default",
        ...opts,
      });
      setIsOpen(true);
      setResolveCallback(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolveCallback) resolveCallback(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolveCallback) resolveCallback(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) handleCancel(); // Bấm ra ngoài hoặc bấm X coi như là Cancel
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* --- UI MODAL CONFIRM (Nằm chờ sẵn) --- */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {options.variant === "destructive" && (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              {options.title}
            </DialogTitle>
            <DialogDescription className="py-2 text-slate-600">
              {options.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancel}>
              {options.cancelText}
            </Button>
            <Button
              variant={
                options.variant === "destructive" ? "destructive" : "default"
              }
              onClick={handleConfirm}
            >
              {options.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
};
