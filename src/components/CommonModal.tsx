import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import React from "react";

interface CommonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode; // string hoặc component
  description?: string; // Optional: mô tả nhỏ dưới title
  icon?: React.ReactNode; // Optional: Icon bên cạnh title
  children: React.ReactNode; // Nội dung chính (Form, Text...)

  // Footer props
  footer?: React.ReactNode; // Nếu muốn custom toàn bộ footer
  onConfirm?: () => void; // Hàm chạy khi bấm Confirm
  confirmText?: string;
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  cancelText?: string;
  loading?: boolean; // Hiển thị spinner khi đang xử lý
  disableConfirm?: boolean; // Disable nút confirm (ví dụ: chưa chọn item)
}

export const CommonModal: React.FC<CommonModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  icon,
  children,
  footer,
  onConfirm,
  confirmText = "Confirm",
  confirmVariant = "default",
  cancelText = "Cancel",
  loading = false,
  disableConfirm = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-max !gap-2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon && <span className="text-primary">{icon}</span>}
            {title}
          </DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </DialogHeader>

        <div className="">{children}</div>

        {/* Nếu có footer custom thì dùng, không thì dùng default */}
        {footer ? (
          footer
        ) : (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {cancelText}
            </Button>
            {onConfirm && (
              <Button
                variant={confirmVariant}
                onClick={onConfirm}
                disabled={loading || disableConfirm}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {confirmText}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
