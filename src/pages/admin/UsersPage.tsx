import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/UserAvatar";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { UserRole, UserStatus } from "@/types";
import {
  Ban,
  Calendar,
  Check,
  Clock,
  MoreVertical,
  RefreshCw,
  Shield,
  ShieldCheck,
  UserCheck,
  User as UserIcon,
  X,
} from "lucide-react";

// --- 1. HELPER COMPONENTS & FUNCTIONS ---

const formatDate = (timestamp?: number, short = false) => {
  if (!timestamp) return "Not updated";
  if (short) {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  }
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
    <div className="bg-background relative">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-background/95 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border pt-4 md:pt-6">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800 text-sm font-medium text-card-foreground shrink-0">
          Total:{" "}
          <span className="text-blue-600 dark:text-blue-400 font-bold text-base">
            {allUsers.length}
          </span>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <Card className="border shadow-sm bg-card mt-4 md:mt-6">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Clock className="animate-spin mb-3 h-8 w-8 mx-auto text-blue-500" />
            <p className="text-sm font-medium">Syncing data...</p>
          </CardContent>
        </Card>
      ) : allUsers.length === 0 ? (
        <Card className="border shadow-sm bg-card mt-4 md:mt-6">
          <CardContent className="py-16 text-center text-muted-foreground">
            <UserIcon className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium">No user data available.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4 mt-4 md:mt-6 mb-8">
          {allUsers.map((user) => (
            <Card
              key={user.id}
              className="border shadow-sm bg-card hover:shadow-md transition-shadow py-0"
            >
              <CardContent className="p-3 md:p-4 relative">
                {/* Actions - Top Right */}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  {/* Desktop Actions */}
                  <div className="hidden md:flex items-center gap-1">
                    {(user.status === UserStatus.PENDING ||
                      user.status === UserStatus.REJECTED) && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 h-7 px-2.5 text-xs"
                        onClick={() => approveUser(user.id)}
                      >
                        {user.status === UserStatus.REJECTED ? (
                          <RefreshCw size={11} className="mr-1" />
                        ) : (
                          <Check size={11} className="mr-1" />
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
                            <Ban size={11} className="mr-1" />
                          ) : (
                            <X size={11} className="mr-1" />
                          )}
                          {user.status === UserStatus.APPROVED
                            ? "Block"
                            : "Reject"}
                        </Button>
                      )}
                  </div>

                  {/* Mobile Actions Dropdown */}
                  {user.role !== UserRole.ADMIN && (
                    <div className="md:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground"
                          >
                            <MoreVertical size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {(user.status === UserStatus.PENDING ||
                            user.status === UserStatus.REJECTED) && (
                            <DropdownMenuItem
                              onClick={() => approveUser(user.id)}
                              className="text-green-600 dark:text-green-400 cursor-pointer"
                            >
                              {user.status === UserStatus.REJECTED ? (
                                <RefreshCw size={14} className="mr-2" />
                              ) : (
                                <Check size={14} className="mr-2" />
                              )}
                              {user.status === UserStatus.REJECTED
                                ? "Reopen"
                                : "Approve"}
                            </DropdownMenuItem>
                          )}

                          {(user.status === UserStatus.PENDING ||
                            user.status === UserStatus.APPROVED) && (
                            <>
                              {user.status === UserStatus.PENDING && (
                                <DropdownMenuSeparator />
                              )}
                              <DropdownMenuItem
                                onClick={() => rejectUser(user.id)}
                                className="text-red-600 dark:text-red-400 cursor-pointer"
                              >
                                {user.status === UserStatus.APPROVED ? (
                                  <Ban size={14} className="mr-2" />
                                ) : (
                                  <X size={14} className="mr-2" />
                                )}
                                {user.status === UserStatus.APPROVED
                                  ? "Block"
                                  : "Reject"}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                {/* Main Content */}
                <div className="flex items-start gap-3 pr-20 md:pr-28">
                  {/* Avatar */}
                  <div className="shrink-0">
                    <UserAvatar email={user.email} photoUrl={user.photoURL} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-2">
                      {/* Email & Badges */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                        <span className="font-medium text-sm md:text-base text-foreground truncate">
                          {user.email}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <RoleBadge role={user.role} />
                          <StatusBadge status={user.status} />
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar size={10} className="shrink-0" />
                          <span className="hidden sm:inline whitespace-nowrap">
                            {formatDate(user.createdAt)}
                          </span>
                          <span className="sm:hidden whitespace-nowrap">
                            {formatDate(user.createdAt, true)}
                          </span>
                        </div>
                        {user.lastLoginAt && (
                          <>
                            <span className="hidden sm:inline whitespace-nowrap">
                              •
                            </span>
                            <div className="flex items-center gap-1">
                              <Clock size={10} className="shrink-0" />
                              <span className="text-blue-600 dark:text-blue-400">
                                <span className="hidden sm:inline whitespace-nowrap">
                                  {formatDate(user.lastLoginAt)}
                                </span>
                                <span className="sm:hidden">
                                  {formatDate(user.lastLoginAt, true)}
                                </span>
                              </span>
                            </div>
                          </>
                        )}
                        {user.status !== UserStatus.PENDING &&
                          user.approvedBy && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <div className="flex items-center gap-1">
                                <ShieldCheck
                                  size={10}
                                  className="text-green-600 dark:text-green-500 shrink-0"
                                />
                                <span className="font-mono text-[10px] truncate">
                                  {user.approvedBy || "Admin"}
                                </span>
                              </div>
                            </>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersPage;
