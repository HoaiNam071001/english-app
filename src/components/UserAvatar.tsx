import { UserStatus } from "@/types";
import { UserIcon } from "lucide-react";
import React from "react";

export const UserAvatar = ({
  email,
  photoUrl,
  status,
  isGuest,
}: {
  email: string;
  photoUrl?: string;
  status?: UserStatus;
  isGuest?: boolean;
}) => {
  const [imageError, setImageError] = React.useState(false);
  const firstLetter = email.charAt(0).toUpperCase();

  if (photoUrl && !imageError) {
    return (
      <img
        src={photoUrl}
        alt={email}
        className="h-9 w-9 shrink-0 rounded-full object-cover border border-border"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className={`
        flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm
        ${
          isGuest
            ? "bg-orange-100 hover:bg-orange-200 border-orange-300 dark:bg-orange-900/20"
            : status === UserStatus.PENDING
            ? "bg-blue-600"
            : "bg-muted-foreground"
        }
      `}
    >
      {isGuest ? (
        <UserIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
      ) : (
        firstLetter
      )}
    </div>
  );
};
