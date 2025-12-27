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
import { useAuth } from "@/hooks/useAuth";
import { Loader2, PersonStanding } from "lucide-react"; // Import icon UserOff
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Thêm prop onGuestLogin
const EmailEntry = () => {
  const { loginWithGoogle, userProfile, isGuest, loading, error, setIsGuest } =
    useAuth();
  const navigation = useNavigate();

  useEffect(() => {
    if (userProfile || isGuest) {
      navigation(ROUTES.HOME);
    }
  }, [userProfile, isGuest]);

  const onGuestLogin = () => {
    localStorage.setItem(STORAGE_KEY.IS_GUEST, "true");
    setIsGuest(true);
  };

  const handleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="flex items-center justify-center min-h-[100vh]">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Hello 👋</CardTitle>
          <CardDescription>Sign in to sync your vocabulary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Google Login */}
            <Button
              variant="outline"
              className="w-full py-6 text-md flex gap-2 items-center justify-center"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <img src={logo} alt="Google Logo" className="h-5 w-5" />
              )}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            {/* Guest Login Button */}
            <Button
              variant="secondary"
              className="w-full flex gap-2"
              onClick={onGuestLogin}
              disabled={loading}
            >
              <PersonStanding className="h-4 w-4" />
              Try without signing in
            </Button>

            {error && (
              <p className="text-sm text-center text-red-500">{error}</p>
            )}

            <div className="text-center text-xs text-muted-foreground mt-2">
              Guest mode: Data is only saved on this device.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailEntry;
