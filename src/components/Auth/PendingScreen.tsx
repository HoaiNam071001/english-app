// src/components/PendingScreen.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, LogOut } from "lucide-react";
import React from "react";

interface PendingScreenProps {
  onLogout: () => void;
  email: string;
}

const PendingScreen: React.FC<PendingScreenProps> = ({ onLogout, email }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4 text-center">
        <CardHeader>
          <div className="mx-auto bg-yellow-100 p-3 rounded-full w-fit mb-4">
            <Clock size={32} className="text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Pending Approval</CardTitle>
          <CardDescription className="pt-2">
            Account <strong>{email}</strong> has been registered.
            <br />
            Please contact Admin to get access permission.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingScreen;
