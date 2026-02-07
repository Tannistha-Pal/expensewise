import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 md:pl-8 pt-16 md:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
