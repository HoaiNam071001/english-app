import { Button } from "../ui/button";

// --- Components phụ: Màn hình bị từ chối ---
export const RejectedScreen = ({ onLogout }: { onLogout: () => void }) => (
  <div className="h-screen flex items-center justify-center flex-col gap-4">
    <h2 className="text-xl text-red-600 font-bold">
      Access Denied
    </h2>
    <Button onClick={onLogout}>Logout</Button>
  </div>
);
