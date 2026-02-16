import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, LayoutDashboard, CheckSquare, BarChart3, CalendarDays, FileText, Timer, Layers, Settings, LogOut, Menu} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { to: "/dashboard/tasks", icon: CheckSquare, label: "Tasks" },
  { to: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/dashboard/study-planner", icon: CalendarDays, label: "Study Planner" },
  { to: "/dashboard/test-generator", icon: FileText, label: "Test Generator" },
  { to: "/dashboard/pomodoro", icon: Timer, label: "Pomodoro" },
  { to: "/dashboard/flashcards", icon: Layers, label: "Flashcards" },
  { to: "/dashboard/settings", icon: Settings, label: "Settings" },
];

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <div className="p-6 flex flex-col items-center gap-4">
        <div className="w-32 h-32 bg-primary rounded-xl shadow-lg flex items-center justify-center">
          <BookOpen className="w-20 h-20 text-primary-foreground" />
        </div>
        <div className="text-center">
          <span className="text-2xl font-bold text-sidebar-primary-foreground block">Sage Flow</span>
          <span className="text-sm text-sidebar-foreground/70 italic">Stay in touch</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sm font-bold text-sidebar-primary">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-full text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </>
  );
};

export const DashboardSidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile header bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-sidebar border-b border-sidebar-border flex items-center px-4 gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground border-sidebar-border">
            <div className="flex flex-col h-full">
              <SidebarContent onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <span className="text-xl font-bold text-sidebar-primary-foreground block leading-tight">Sage Flow</span>
            <span className="text-[10px] text-sidebar-foreground/70 italic">Stay in touch</span>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-sidebar text-sidebar-foreground flex-col shrink-0 border-r border-sidebar-border sticky top-0 h-screen overflow-y-auto">
        <SidebarContent />
      </aside>
    </>
  );
};
