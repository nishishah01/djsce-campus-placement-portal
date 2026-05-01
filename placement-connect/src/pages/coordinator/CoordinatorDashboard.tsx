import { useJobs, useApplications, useStudents } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
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

const TEAL = "#2cb5a0";
const DEPT_COLORS = [TEAL, "#34c5af", "#1a9d8a", "#0d8573", "#45d4bc", "#22b09c", "#57e0ca", "#10917f"];
const CGPA_COLORS = ["#ef4444", "#f59e0b", TEAL, "#06b6d4", "#6366f1"];
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
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  labelStyle: { color: "#111827", fontWeight: 600 },
  itemStyle: { color: "#6b7280" },
};

export default function CoordinatorDashboard() {
  const { userName } = useAuth();
  const { data: jobs = [] } = useJobs();
  const { data: applications = [] } = useApplications();
  const { data: students = [] } = useStudents();

  const stats = [
    { label: "Total Companies", value: new Set(jobs.map((j) => j.companyName)).size, icon: Building2, color: TEAL, bg: "#e6f9f6" },
    { label: "Job Openings", value: jobs.length, icon: Briefcase, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Total Applications", value: applications.length, icon: Users, color: "#f59e0b", bg: "#fffbeb" },
    { label: "Students Placed", value: applications.filter((a) => a.status === "accepted").length, icon: CheckCircle, color: "#10b981", bg: "#ecfdf5" },
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
        {/* Page title */}
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">Welcome back, {userName || "Coordinator"} — Overview of all placement activities</p>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0"
                style={{ background: s.bg }}
              >
                <s.icon className="h-6 w-6" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Department-wise Applications */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-1">Department-wise Applications</h2>
            <p className="text-xs text-gray-400 mb-4">Total applications submitted per department</p>
            {deptData.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400">No application data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={deptData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="dept" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <Tooltip {...tooltipStyle} formatter={(v) => [v, "Applications"]} />
                  <Bar dataKey="count" radius={[5, 5, 0, 0]} name="Applications">
                    {deptData.map((_, i) => (
                      <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* CGPA Range Distribution */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-1">CGPA Range Distribution</h2>
            <p className="text-xs text-gray-400 mb-4">Applicant count across CGPA bands</p>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={cgpaData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="range" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <Tooltip {...tooltipStyle} formatter={(v) => [v, "Students"]} />
                <Bar dataKey="count" radius={[5, 5, 0, 0]} name="Students">
                  {cgpaData.map((_, i) => (
                    <Cell key={i} fill={CGPA_COLORS[i % CGPA_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Company-wise Applications */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Company-wise Applications</h2>
          <div className="space-y-3">
            {jobs.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">No data yet.</p>
            )}
            {jobs.map((job) => {
              const apps = applications.filter((a) => a.jobId === job.id);
              const pct = applications.length ? Math.round((apps.length / applications.length) * 100) : 0;
              return (
                <div key={job.id} className="flex items-center gap-4 rounded-xl border border-gray-100 p-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{job.companyName}</p>
                    <p className="text-xs text-gray-400 truncate">{job.role}</p>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: TEAL }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-gray-800">{apps.length}</p>
                    <p className="text-xs text-gray-400">applicants</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
