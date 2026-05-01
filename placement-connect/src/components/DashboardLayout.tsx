import { useAuth } from "@/contexts/AuthContext";
import {
  Briefcase,
  GraduationCap,
  LogOut,
  Menu,
  Shield,
  X,
  LayoutDashboard,
  FileText,
  User,
  BookOpen,
  ClipboardList,
  Users,
  PlusSquare,
  Home,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

type NavItem = { label: string; path: string; icon: typeof LayoutDashboard };

const navItems: Record<string, NavItem[]> = {
  student: [
    { label: "Dashboard", path: "/student", icon: LayoutDashboard },
    { label: "Jobs", path: "/student/jobs", icon: Briefcase },
    { label: "My Applications", path: "/student/applications", icon: FileText },
    { label: "Profile", path: "/student/profile", icon: User },
  ],
  recruiter: [
    { label: "Dashboard", path: "/recruiter", icon: LayoutDashboard },
    { label: "Post Job", path: "/recruiter/post", icon: PlusSquare },
    { label: "My Postings", path: "/recruiter/postings", icon: ClipboardList },
  ],
  coordinator: [
    { label: "Dashboard", path: "/coordinator", icon: LayoutDashboard },
    { label: "Applications", path: "/coordinator/applications", icon: BookOpen },
    { label: "Students", path: "/coordinator/students", icon: Users },
  ],
};

const roleIcons = {
  student: GraduationCap,
  recruiter: Briefcase,
  coordinator: Shield,
};

const roleLabels = {
  student: "Student Portal",
  recruiter: "Recruiter Portal",
  coordinator: "Coordinator Portal",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role, userName, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!role) return null;

  const Icon = roleIcons[role];
  const items = navItems[role];

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      {/* ── Sidebar ── */}
      <aside
        className={`
          portal-sidebar fixed inset-y-0 left-0 z-40 flex w-56 flex-col transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:flex
        `}
      >
        {/* Sidebar logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/20">
          <div className="flex items-center justify-center w-9 h-9 bg-white/20 rounded-lg">
            <img
              src="/favicon.ico"
              alt="DJSCE"
              className="h-6 w-6 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">PLACEMENT</p>
            <p className="text-white/70 text-xs leading-tight">PORTAL</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {items.map((item) => {
            const ItemIcon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 mb-1 text-sm font-medium transition-all
                  ${active
                    ? "bg-white/20 text-white border-l-4 border-white pl-2"
                    : "text-white/80 hover:bg-white/10 hover:text-white border-l-4 border-transparent pl-2"
                  }
                `}
              >
                <ItemIcon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div className="px-3 py-4 border-t border-white/20">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Main content area ── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top header bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="flex h-14 items-center justify-between px-5">
            {/* Left: mobile toggle + breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div className="hidden md:flex items-center gap-2 text-sm">
                <Home className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-400">/</span>
                <span className="text-teal-600 font-medium">
                  {items.find((i) => i.path === location.pathname)?.label ?? "Dashboard"}
                </span>
              </div>
            </div>

            {/* Right: datetime + user */}
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-xs text-gray-400">
                Last update: {dateStr} / {timeStr}
              </span>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">
                  {userName?.charAt(0)?.toUpperCase() ?? <Icon className="h-4 w-4" />}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-gray-800 leading-tight">
                    {userName ?? "User"}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-tight capitalize">{role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}