import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React from "react";

interface CommonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  closeOnInteractOutside?: boolean;
  footer?: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  cancelText?: string;
  loading?: boolean;
  disableConfirm?: boolean;
  contentClassName?: string;
}

export const CommonModal: React.FC<CommonModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  icon,
  children,
  closeOnInteractOutside = true, // Giá trị mặc định
  footer,
  onConfirm,
  confirmText = "Confirm",
  confirmVariant = "default",
  cancelText = "Cancel",
  loading = false,
  disableConfirm = false,
  contentClassName = "",
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-[95vw] md:!max-w-max !gap-2"
        // Chặn sự kiện đóng khi tương tác ra ngoài nếu flag là false
        onInteractOutside={(e) => {
          if (!closeOnInteractOutside) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon && <span className="text-primary">{icon}</span>}
            {title}
          </DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </DialogHeader>

        <div className={cn("max-w-full", contentClassName)}>{children}</div>

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
