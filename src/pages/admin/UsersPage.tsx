import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/UserAvatar";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { UserRole, UserStatus } from "@/types";
import {
  Ban,
  Calendar,
  Check,
  Clock,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  User as UserIcon,
  X,
} from "lucide-react";

// --- 1. HELPER COMPONENTS & FUNCTIONS ---

const formatDate = (timestamp?: number) => {
  if (!timestamp) return "Not updated";
  return new Date(timestamp).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const RoleBadge = ({ role }: { role: UserRole }) => {
  const isAdmin = role === UserRole.ADMIN;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
        isAdmin
          ? "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
          : "bg-muted text-muted-foreground border-border"
      }`}
    >
      {isAdmin ? (
        <Shield size={9} className="fill-purple-200 dark:fill-purple-400" />
      ) : (
        <UserIcon size={9} />
      )}
      {isAdmin ? "ADMIN" : "USER"}
    </span>
  );
};

const StatusBadge = ({ status }: { status: UserStatus }) => {
  const styles = {
    [UserStatus.PENDING]:
      "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    [UserStatus.APPROVED]:
      "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    [UserStatus.REJECTED]:
      "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  };

  const icons = {
    [UserStatus.PENDING]: <Clock size={12} />,
    [UserStatus.APPROVED]: <UserCheck size={12} />,
    [UserStatus.REJECTED]: <Ban size={12} />,
  };

  const labels = {
    [UserStatus.PENDING]: "Pending",
    [UserStatus.APPROVED]: "Active",
    [UserStatus.REJECTED]: "Blocked",
  };

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded font-medium border ${styles[status]}`}
    >
      {icons[status]}
      <span className="ml-0.5">{labels[status]}</span>
    </span>
  );
};

// --- 2. MAIN COMPONENT ---

const UsersPage = () => {
  const { userProfile } = useAuth();
  const { allUsers, loading, approveUser, rejectUser } = useAdmin(userProfile);

  return (
    <div className="bg-background">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border pt-4">
        <div className="flex items-center gap-2">
          <ShieldAlert
            className="text-orange-600 dark:text-orange-500"
            size={20}
          />
          <div>
            <div className="text-xl font-bold text-foreground mb-2">
              System Administration
            </div>
            <p className="text-xs text-muted-foreground">
              Manage access and members
            </p>
          </div>
        </div>
        <div className="bg-card px-3 py-1.5 rounded-md border text-xs font-medium text-card-foreground">
          Total:{" "}
          <span className="text-blue-600 dark:text-blue-400 font-bold">
            {allUsers.length}
          </span>
        </div>
      </div>

      {/* LIST */}
      <Card className="border shadow-sm bg-card mt-4">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              <Clock className="animate-spin mb-2 h-6 w-6 mx-auto text-blue-500" />
              <p className="text-sm">Syncing data...</p>
            </div>
          ) : allUsers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <UserIcon className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm">No user data available.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {allUsers.map((user) => (
                <div
                  key={user.id}
                  className="group px-4 py-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <UserAvatar email={user.email} photoUrl={user.photoURL} />

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-foreground truncate">
                          {user.email}
                        </span>
                        <RoleBadge role={user.role} />
                        <StatusBadge status={user.status} />
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                        {user.lastLoginAt && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              <span className="text-blue-600 dark:text-blue-400">
                                {formatDate(user.lastLoginAt)}
                              </span>
                            </div>
                          </>
                        )}
                        {user.status !== UserStatus.PENDING &&
                          user.approvedBy && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <ShieldCheck
                                  size={12}
                                  className="text-green-600 dark:text-green-500"
                                />
                                <span className="font-mono text-[10px]">
                                  {user.approvedBy || "Admin"}
                                </span>
                              </div>
                            </>
                          )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(user.status === UserStatus.PENDING ||
                        user.status === UserStatus.REJECTED) && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 h-7 px-2.5 text-xs"
                          onClick={() => approveUser(user.id)}
                        >
                          {user.status === UserStatus.REJECTED ? (
                            <RefreshCw size={12} className="mr-1" />
                          ) : (
                            <Check size={12} className="mr-1" />
                          )}
                          {user.status === UserStatus.REJECTED
                            ? "Reopen"
                            : "Approve"}
                        </Button>
                      )}

                      {user.role !== UserRole.ADMIN &&
                        (user.status === UserStatus.PENDING ||
                          user.status === UserStatus.APPROVED) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 px-2.5 text-xs"
                            onClick={() => rejectUser(user.id)}
                          >
                            {user.status === UserStatus.APPROVED ? (
                              <Ban size={12} className="mr-1" />
                            ) : (
                              <X size={12} className="mr-1" />
                            )}
                            {user.status === UserStatus.APPROVED
                              ? "Block"
                              : "Reject"}
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
  );
};

export default UsersPage;
