/* eslint-disable react-hooks/exhaustive-deps */
import logo from "@/assets/gg.png";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES, STORAGE_KEY } from "@/constants";
import { useAuth } from "@/hooks/useAuth"; // Hook mới (Redux wrapped)
import { SavedAccount } from "@/types";
import { CheckCircle2, Loader2, PersonStanding, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const EmailEntry = () => {
  const {
    loginWithGoogle,
    userProfile,
    user,
    isGuest,
    loading,
    error,
    setIsGuest,
    removeSavedAccount,
  } = useAuth();

  const navigation = useNavigate();
  const { t } = useTranslation("auth");
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);

  useEffect(() => {
    if (userProfile || isGuest) {
      navigation(ROUTES.HOME);
    }
  }, [userProfile, isGuest, navigation]);

  useEffect(() => {
    const loadAccounts = () => {
      const stored = localStorage.getItem(STORAGE_KEY.SAVED_ACCOUNTS);
      if (stored) {
        setSavedAccounts(JSON.parse(stored));
      }
    };
    loadAccounts();
  }, [user]); // Thêm dependency user để re-load khi login xong

  const onGuestLogin = () => {
    setIsGuest(true); // Logic localStorage đã xử lý trong slice
  };

  const handleLogin = async (emailHint?: string) => {
    try {
      await loginWithGoogle(emailHint);
    } catch (e) {
      console.error("Login Error UI:", e);
    }
  };

  const handleRemoveAccount = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    removeSavedAccount(email);
    // Update local UI state ngay lập tức
    setSavedAccounts((prev) => prev.filter((acc) => acc.email !== email));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 transition-colors duration-300">
      <Card className="w-full max-w-md shadow-lg border-border bg-card">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-foreground">
            {t("login.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("login.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* DANH SÁCH TÀI KHOẢN */}
            {savedAccounts.length > 0 && (
              <>
                <div className="space-y-2 mb-4 max-h-[400px] overflow-auto">
                  {savedAccounts.map((acc) => {
                    const isActiveSession = user?.email === acc.email;

                    return (
                      <div
                        key={acc.uid}
                        className={`
                        relative group flex items-center gap-3 p-3 border rounded-lg transition-all cursor-pointer
                        ${
                          isActiveSession
                            ? "border-green-500/50 bg-green-500/10 dark:bg-green-500/20"
                            : "border-border bg-card hover:bg-accent"
                        }
                      `}
                        onClick={() => handleLogin(acc.email)}
                      >
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center flex-shrink-0 relative">
                          {acc.photoURL ? (
                            <img
                              src={acc.photoURL}
                              alt={t("login.avatarAlt")}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-muted-foreground" />
                          )}
                          {isActiveSession && (
                            <div className="absolute inset-0 bg-black/10 dark:bg-black/30 flex items-center justify-center rounded-full">
                              <div className="bg-green-500 rounded-full p-0.5 border-2 border-background"></div>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-medium text-sm text-foreground truncate">
                            {acc.displayName || acc.email}
                          </p>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground truncate">
                              {acc.email}
                            </span>
                            {isActiveSession ? (
                              <span className="text-[10px] hidden md:inline text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-1.5 rounded-full ml-1 font-medium flex items-center gap-0.5 w-fit">
                                {t("login.current")}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 rounded-full ml-1 w-fit">
                                {t("login.signedOut")}
                              </span>
                            )}
                          </div>
                        </div>

                        {!isActiveSession && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2"
                            onClick={(e) => handleRemoveAccount(e, acc.email)}
                            title={t("login.removeAccount")}
                          >
                            <X size={16} />
                          </Button>
                        )}

                        {isActiveSession && (
                          <div className="absolute right-3 text-green-600 dark:text-green-500">
                            <CheckCircle2 size={20} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      {t("login.orAddAnother")}
                    </span>
                  </div>
                </div>
              </>
            )}

            <Button
              variant={savedAccounts.length > 0 ? "secondary" : "default"}
              className={`w-full py-6 text-md flex gap-2 items-center justify-center`}
              onClick={() => handleLogin()}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <img src={logo} alt={t("login.googleLogoAlt")} className="h-5 w-5" />
              )}
              {savedAccounts.length > 0
                ? t("login.signInAnother")
                : t("login.continueWithGoogle")}
            </Button>

            {savedAccounts.length === 0 && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {t("login.or")}
                  </span>
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              className="w-full flex gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={onGuestLogin}
              disabled={loading}
            >
              <PersonStanding className="h-4 w-4" />
              {t("login.tryWithoutSignIn")}
            </Button>

            {error && (
              <p className="text-sm text-center text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                {error}
              </p>
            )}

            <div className="text-center text-xs text-muted-foreground mt-4">
              {t("login.guestNote")}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailEntry;
