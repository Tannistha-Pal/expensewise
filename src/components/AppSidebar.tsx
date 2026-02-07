import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AddTransactionModal } from "@/components/AddTransactionModal";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Transactions", path: "/dashboard/transactions", icon: ArrowLeftRight },
  { title: "Budget", path: "/dashboard/budget", icon: PiggyBank },
  { title: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
  { title: "Settings", path: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full py-6 px-4">
      {/* Brand */}
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          💰 ExpenseWise
        </h1>
      </div>

      {/* Add Transaction Button */}
      <Button
        onClick={() => { setAddModalOpen(true); setMobileOpen(false); }}
        className="mb-6 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Transaction
      </Button>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/25 text-white shadow-sm"
                  : "text-white/75 hover:bg-white/15 hover:text-white"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.title}
          </NavLink>
        ))}
      </nav>

      {/* Log Out */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/75 hover:bg-white/15 hover:text-white transition-colors mt-4"
      >
        <LogOut className="h-5 w-5" />
        Log Out
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-gradient-to-b from-blue-600 to-teal-500 p-2 text-white shadow-lg md:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-blue-600 to-teal-500 transition-transform duration-300 md:relative md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      <AddTransactionModal open={addModalOpen} onOpenChange={setAddModalOpen} />
    </>
  );
}
