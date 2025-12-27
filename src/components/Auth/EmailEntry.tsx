import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, PersonStanding } from "lucide-react"; // Import icon UserOff

// Thêm prop onGuestLogin
const EmailEntry = ({ onGuestLogin }: { onGuestLogin: () => void }) => {
  const { loginWithGoogle, loading, error } = useAuth();

  const handleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="flex items-center justify-center min-h-[100vh]">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Xin chào 👋</CardTitle>
          <CardDescription>
            Đăng nhập để đồng bộ từ vựng của bạn
          </CardDescription>
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
                <svg className="h-5 w-5" viewBox="0 0 488 512">
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  ></path>
                </svg>
              )}
              Tiếp tục với Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Hoặc
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
              Dùng thử không cần đăng nhập
            </Button>

            {error && (
              <p className="text-sm text-center text-red-500">{error}</p>
            )}

            <div className="text-center text-xs text-muted-foreground mt-2">
              Chế độ khách: Dữ liệu chỉ lưu trên thiết bị này.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailEntry;
