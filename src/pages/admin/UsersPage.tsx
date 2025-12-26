import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Check, X, ArrowLeft, ShieldAlert, UserCheck, Ban, 
  Clock, Calendar, ShieldCheck, User as UserIcon, Shield, RefreshCw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile, UserRole, UserStatus } from "@/types";

// --- 1. HELPER COMPONENTS & FUNCTIONS ---

const formatDate = (timestamp?: number) => {
  if (!timestamp) return "Chưa cập nhật";
  return new Date(timestamp).toLocaleString("vi-VN", {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

const RoleBadge = ({ role }: { role: UserRole }) => {
  const isAdmin = role === UserRole.ADMIN;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border ${
      isAdmin 
        ? "bg-purple-100 text-purple-700 border-purple-200" 
        : "bg-slate-100 text-slate-600 border-slate-200"
    }`}>
      {isAdmin ? <Shield size={10} className="fill-purple-200" /> : <UserIcon size={10} />}
      {isAdmin ? "ADMIN" : "USER"}
    </span>
  );
};

const StatusBadge = ({ status }: { status: UserStatus }) => {
  const styles = {
    [UserStatus.PENDING]: "bg-yellow-50 text-yellow-700 border-yellow-200",
    [UserStatus.APPROVED]: "bg-green-50 text-green-700 border-green-200",
    [UserStatus.REJECTED]: "bg-red-50 text-red-700 border-red-200",
  };
  
  const icons = {
    [UserStatus.PENDING]: <Clock size={12} />,
    [UserStatus.APPROVED]: <UserCheck size={12} />,
    [UserStatus.REJECTED]: <Ban size={12} />,
  };

  const labels = {
    [UserStatus.PENDING]: "Chờ duyệt",
    [UserStatus.APPROVED]: "Đang hoạt động",
    [UserStatus.REJECTED]: "Đã chặn",
  };

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium border ${styles[status]}`}>
      {icons[status]} {labels[status]}
    </span>
  );
};

// --- 2. MAIN COMPONENT ---

const UsersPage = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { allUsers, loading, approveUser, rejectUser } = useAdmin(userProfile);

  // Guard Clause
  if (!loading && userProfile?.role !== UserRole.ADMIN) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <div className="container mx-auto max-w-5xl space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate("/")} className="rounded-full bg-white">
              <ArrowLeft size={18} />
            </Button>
            <div>
              <div className="text-xl font-bold flex items-center gap-2 text-slate-900">
                <ShieldAlert className="text-orange-600" size={24} /> 
                Quản trị hệ thống
              </div>
              <p className="text-slate-500 text-sm">Kiểm soát truy cập và thành viên</p>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-full border shadow-sm text-sm font-medium text-slate-700">
              Tổng thành viên: <span className="text-blue-600 font-bold">{allUsers.length}</span>
          </div>
        </div>

        {/* LIST */}
        <Card className="border-none shadow-lg bg-white">
          <CardHeader className="border-b bg-slate-50/50 pb-4">
            <CardTitle className="text-lg">Danh sách tài khoản</CardTitle>
            <CardDescription>Quản lý trạng thái và phê duyệt người dùng mới.</CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-slate-400">
                 <Clock className="animate-spin mb-3 h-8 w-8 mx-auto text-blue-500" />
                 <p>Đang đồng bộ dữ liệu...</p>
              </div>
            ) : allUsers.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <UserIcon className="mx-auto h-12 w-12 text-slate-200 mb-3" />
                <p>Hệ thống chưa có dữ liệu user.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {allUsers.map((user) => (
                  <div key={user.id} className="group p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                      
                      {/* Avatar & Email */}
                      <div className="flex gap-4 flex-1">
                        <div className={`
                            flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ring-2 ring-white
                            ${user.status === UserStatus.PENDING ? 'bg-orange-500' : 'bg-slate-600'}
                        `}>
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-900">{user.email}</span>
                            <RoleBadge role={user.role} />
                            <StatusBadge status={user.status} />
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono">UID: {user.id}</p>

                          {/* Info Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 mt-3 text-sm text-slate-600">
                            <div className="flex items-center gap-2 text-xs">
                                <Calendar size={14} className="text-slate-400" />
                                <span className="text-slate-500">Đăng ký:</span> 
                                <span className="font-medium">{formatDate(user.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <Clock size={14} className="text-slate-400" />
                                <span className="text-slate-500">Login cuối:</span>
                                <span className="font-medium text-blue-600">{user.lastLoginAt ? formatDate(user.lastLoginAt) : "N/A"}</span>
                            </div>

                            {/* Approval Info */}
                            {user.status !== UserStatus.PENDING && (
                              <div className="sm:col-span-2 flex items-center gap-2 text-xs mt-1 pt-2 border-t border-slate-100 border-dashed">
                                  <ShieldCheck size={14} className="text-green-600" />
                                  <span className="text-slate-500">
                                    Duyệt bởi <span className="font-mono text-slate-700 font-medium">{user.approvedBy || "Admin"}</span> 
                                    {user.approvedAt && <span className="text-slate-400"> • {formatDate(user.approvedAt)}</span>}
                                  </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* --- PHẦN ĐÃ SỬA: Actions --- */}
                      <div className="flex items-center gap-2 lg:self-center pt-2 lg:pt-0 lg:pl-4 lg:border-l border-slate-100">
                        
                        {/* 1. Nút DUYỆT / MỞ LẠI (Hiện khi Pending hoặc Rejected) */}
                        {(user.status === UserStatus.PENDING || user.status === UserStatus.REJECTED) && (
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 h-8 text-xs shadow-sm cursor-pointer"
                              onClick={() => approveUser(user.email)}
                            >
                              {user.status === UserStatus.REJECTED ? (
                                <RefreshCw size={14} className="mr-1" />
                              ) : (
                                <Check size={14} className="mr-1" />
                              )}
                              {user.status === UserStatus.REJECTED ? "Mở lại" : "Duyệt"}
                            </Button>
                        )}

                        {/* 2. Nút TỪ CHỐI / CHẶN (Hiện khi Pending hoặc Approved) */}
                        {user.role !== UserRole.ADMIN && (user.status === UserStatus.PENDING || user.status === UserStatus.APPROVED) && (
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="h-8 text-xs shadow-sm cursor-pointer"
                              onClick={() => rejectUser(user.email)}
                            >
                              {user.status === UserStatus.APPROVED ? (
                                <Ban size={14} className="mr-1" />
                              ) : (
                                <X size={14} className="mr-1" />
                              )}
                              {user.status === UserStatus.APPROVED ? "Chặn" : "Từ chối"}
                            </Button>
                        )}
                      </div>
                      
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UsersPage;