import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, GraduationCap, LogOut, Menu, Shield, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = {
  student: [
    { label: "Dashboard", path: "/student" },
    { label: "Jobs", path: "/student/jobs" },
    { label: "My Applications", path: "/student/applications" },
    { label: "Profile", path: "/student/profile" },
  ],
  recruiter: [
    { label: "Dashboard", path: "/recruiter" },
    { label: "Post Job", path: "/recruiter/post" },
    { label: "My Postings", path: "/recruiter/postings" },
  ],
  coordinator: [
    { label: "Dashboard", path: "/coordinator" },
    { label: "Applications", path: "/coordinator/applications" },
    { label: "Students", path: "/coordinator/students" },
  ],
};

const roleIcons = {
  student: GraduationCap,
  recruiter: Briefcase,
  coordinator: Shield,
};

const roleLabels = {
  student: "Student",
  recruiter: "Recruiter",
  coordinator: "Coordinator",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role, userName, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!role) return null;

  const Icon = roleIcons[role];
  const items = navItems[role];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          
          {/* LOGO + TITLE */}
          <div className="flex items-center gap-3">
            <Link to={`/${role}`} className="flex items-center gap-2">
              
              {/* 🔥 LOGO REPLACED HERE */}
              <div className="flex items-center justify-center">
  <img
    src="/favicon.ico"
    alt="College Logo"
    className="h-10 w-10 object-contain"
  />
</div>

              <span className="text-lg font-bold text-foreground">
                DJSCE Campus Placement Portal
              </span>
            </Link>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-1 md:flex">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 md:flex">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{userName}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {roleLabels[role]}
              </span>
            </div>

            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="border-t border-border bg-card p-4 md:hidden">
            <div className="mb-3 flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{userName}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {roleLabels[role]}
              </span>
            </div>

            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <main className="container py-6 animate-fade-in">{children}</main>
    </div>
  );
}