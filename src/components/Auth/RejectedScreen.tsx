import { ADMIN_INFO } from "@/constants";
import { LogOut, UserRoundX } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

// --- Components phụ: Màn hình bị từ chối ---
export const RejectedScreen = ({
  email,
  onLogout,
}: {
  email: string;
  onLogout: () => void;
}) => {
  const { t } = useTranslation(["auth", "common"]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4 text-center">
        <CardHeader>
          <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
            <UserRoundX size={32} className="text-red-600" />
          </div>
          <CardTitle className="text-2xl">{t("rejected.title")}</CardTitle>
          <CardDescription className="pt-2">
            <Trans
              ns="auth"
              i18nKey="rejected.description"
              values={{ email }}
              components={[<strong />]}
            />
            <br />
            <Trans
              ns="auth"
              i18nKey="pending.contactAdmin"
              values={{ email: ADMIN_INFO.email }}
              components={[<strong />]}
            />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" /> {t("common:userMenu.logout")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
