import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X, ShieldAlert } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdmin } from "@/hooks/useAdmin"; // Import Hook

interface AdminUserManagementProps {
  currentAdminId: string;
}

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({
  currentAdminId,
}) => {
  // Sử dụng Hook Admin
  const { pendingUsers, loading, approveUser, rejectUser } =
    useAdmin(currentAdminId);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
        >
          <ShieldAlert size={16} />
          Duyệt User{" "}
          {pendingUsers.length > 0 && (
            <div className="ml-1 px-1 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center min-w-[20px]">
              {pendingUsers.length}
            </div>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Danh sách chờ duyệt</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          {loading ? (
            <div className="text-center py-4 text-sm text-slate-500">
              Đang tải...
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Không có yêu cầu nào mới.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-slate-50"
                >
                  <div className="overflow-hidden">
                    <p
                      className="font-medium text-sm truncate"
                      title={user.email}
                    >
                      {user.email}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-green-600 hover:bg-green-100"
                      onClick={() => approveUser(user.id!)}
                    >
                      {" "}
                      {/* Gọi hàm từ hook */}
                      <Check size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-100"
                      onClick={() => rejectUser(user.id!)}
                    >
                      {" "}
                      {/* Gọi hàm từ hook */}
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AdminUserManagement;
