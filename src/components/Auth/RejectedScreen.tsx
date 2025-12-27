import { ADMIN_INFO } from "@/constants";
import { LogOut, UserRoundX } from "lucide-react";
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
}) => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <Card className="w-full max-w-md mx-4 text-center">
      <CardHeader>
        <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
          <UserRoundX size={32} className="text-red-600" />
        </div>
        <CardTitle className="text-2xl">Access Denied</CardTitle>
        <CardDescription className="pt-2">
          Account <strong>{email}</strong> has been rejected.
          <br />
          Please contact Admin (<strong>{ADMIN_INFO.email}</strong>) to get
          access permission.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="cursor-pointer" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </CardContent>
    </Card>
  </div>
);
