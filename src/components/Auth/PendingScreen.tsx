// src/components/PendingScreen.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ADMIN_INFO } from "@/constants";
import { Clock, LogOut } from "lucide-react";
import React from "react";
import { Trans, useTranslation } from "react-i18next";

interface PendingScreenProps {
  onLogout: () => void;
  email: string;
}

const PendingScreen: React.FC<PendingScreenProps> = ({ onLogout, email }) => {
  const { t } = useTranslation(["auth", "common"]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4 text-center">
        <CardHeader>
          <div className="mx-auto bg-yellow-100 p-3 rounded-full w-fit mb-4">
            <Clock size={32} className="text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">{t("pending.title")}</CardTitle>
          <CardDescription className="pt-2">
            <Trans
              ns="auth"
              i18nKey="pending.description"
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

export default PendingScreen;
