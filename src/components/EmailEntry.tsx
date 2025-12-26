import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { signInWithPopup } from 'firebase/auth'; // Import hàm đăng nhập
import { auth, googleProvider } from '../firebaseConfig'; // Import từ config
import { Loader2 } from 'lucide-react';

interface EmailEntryProps {
  onSubmit: (email: string) => void;
}

const EmailEntry: React.FC<EmailEntryProps> = ({ onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      // 1. Mở popup đăng nhập Google
      const result = await signInWithPopup(auth, googleProvider);
      
      // 2. Lấy email từ kết quả trả về
      const user = result.user;
      console.log('user',user);
      if (user.email) {
        onSubmit(user.email); // Truyền email ra ngoài cho App xử lý
      } else {
        setError("Không lấy được email từ tài khoản Google này.");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      // Xử lý lỗi thường gặp (vd: user tắt popup)
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Bạn đã đóng popup đăng nhập.');
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Xin chào 👋</CardTitle>
          <CardDescription>
            Đăng nhập để đồng bộ từ vựng của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            
            {/* Nút Login Google */}
            <Button 
              variant="outline" 
              className="w-full py-6 text-md flex gap-2 items-center justify-center" 
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                // Icon Google SVG
                <svg className="h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
              )}
              Tiếp tục với Google
            </Button>

            {error && <p className="text-sm text-center text-red-500">{error}</p>}
            
            <div className="text-center text-xs text-slate-400">
              Chỉ lấy email để định danh, không yêu cầu quyền gì khác.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailEntry;