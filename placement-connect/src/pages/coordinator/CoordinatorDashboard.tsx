import { useJobs, useApplications, useStudents } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users, CheckCircle, Building2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const DEPT_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];
const CGPA_COLORS = ["#ef4444", "#f59e0b", "#10b981", "#06b6d4", "#6366f1"];
const CGPA_RANGES = ["< 6", "6 – 7", "7 – 8", "8 – 9", "9 – 10"];

function getCgpaRange(cgpa: number): string {
  if (cgpa < 6) return "< 6";
  if (cgpa < 7) return "6 – 7";
  if (cgpa < 8) return "7 – 8";
  if (cgpa < 9) return "8 – 9";
  return "9 – 10";
}

const tooltipStyle = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    fontSize: 13,
  },
  labelStyle: { color: "hsl(var(--foreground))", fontWeight: 600 },
  itemStyle: { color: "hsl(var(--muted-foreground))" },
};

export default function CoordinatorDashboard() {
  const { userName } = useAuth();
  const { data: jobs = [] } = useJobs();
  const { data: applications = [] } = useApplications();
  const { data: students = [] } = useStudents();

  const stats = [
    { label: "Total Companies", value: new Set(jobs.map((j) => j.companyName)).size, icon: Building2, color: "text-primary" },
    { label: "Job Openings", value: jobs.length, icon: Briefcase, color: "text-info" },
    { label: "Total Applications", value: applications.length, icon: Users, color: "text-warning" },
    { label: "Students Placed", value: applications.filter((a) => a.status === "accepted").length, icon: CheckCircle, color: "text-success" },
  ];

  // Department-wise applications
  const deptMap: Record<string, number> = {};
  applications.forEach((app) => {
    const student = students.find((s) => s.id === app.studentId);
    if (student?.department) {
      deptMap[student.department] = (deptMap[student.department] || 0) + 1;
    }
  });
  const deptData = Object.entries(deptMap)
    .map(([dept, count]) => ({ dept, count }))
    .sort((a, b) => b.count - a.count);

  // CGPA range distribution (only applicants)
  const applicantIds = new Set(applications.map((a) => a.studentId));
  const cgpaMap: Record<string, number> = Object.fromEntries(CGPA_RANGES.map((r) => [r, 0]));
  students.filter((s) => applicantIds.has(s.id)).forEach((s) => {
    const range = getCgpaRange(s.cgpa);
    cgpaMap[range] = (cgpaMap[range] || 0) + 1;
  });
  const cgpaData = CGPA_RANGES.map((range) => ({ range, count: cgpaMap[range] }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome, {userName || "Coordinator"}</h1>
          <p className="text-muted-foreground">Overview of all placement activities</p>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="glass-card">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`rounded-lg bg-muted p-2.5 ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Department-wise Applications */}
          <Card className="glass-card">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold text-foreground">Department-wise Applications</h2>
              <p className="mb-4 text-xs text-muted-foreground">Total applications submitted per department</p>
              {deptData.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No application data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={deptData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="dept" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip {...tooltipStyle} formatter={(v) => [v, "Applications"]} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Applications">
                      {deptData.map((_, i) => (
                        <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* CGPA Range Distribution */}
          <Card className="glass-card">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold text-foreground">CGPA Range Distribution</h2>
              <p className="mb-4 text-xs text-muted-foreground">Applicant count across CGPA bands</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={cgpaData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip {...tooltipStyle} formatter={(v) => [v, "Students"]} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Students">
                    {cgpaData.map((_, i) => (
                      <Cell key={i} fill={CGPA_COLORS[i % CGPA_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Company-wise Applications */}
        <Card className="glass-card">
          <CardContent className="p-5">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Company-wise Applications</h2>
            <div className="space-y-3">
              {jobs.map((job) => {
                const apps = applications.filter((a) => a.jobId === job.id);
                const pct = applications.length ? Math.round((apps.length / applications.length) * 100) : 0;
                return (
                  <div key={job.id} className="flex items-center gap-4 rounded-lg border border-border p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{job.companyName}</p>
                      <p className="text-sm text-muted-foreground truncate">{job.role}</p>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-foreground">{apps.length}</p>
                      <p className="text-xs text-muted-foreground">applicants</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
