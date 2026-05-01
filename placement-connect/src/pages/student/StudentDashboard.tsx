import { useJobs, useApplications, useStudents } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Briefcase, FileText, CheckCircle, Clock } from "lucide-react";
import { formatDeadline, isDeadlinePassed } from "@/lib/deadlineUtils";
import { Link } from "react-router-dom";

const TEAL = "#2cb5a0";

export default function StudentDashboard() {
  const { userId } = useAuth();
  const { data: jobs = [] } = useJobs();
  const { data: applications = [] } = useApplications();
  const { data: students = [] } = useStudents();
  const student = students.find((s) => s.id === userId);
  const myApps = applications.filter((a) => a.studentId === userId);
  const activeJobs = jobs.filter((j) => !isDeadlinePassed(j.deadline));

  const stats = [
    { label: "Active Jobs", value: activeJobs.length, icon: Briefcase, color: TEAL, bg: "#e6f9f6" },
    { label: "Applications", value: myApps.length, icon: FileText, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Shortlisted", value: myApps.filter((a) => a.status === "shortlisted").length, icon: CheckCircle, color: "#10b981", bg: "#ecfdf5" },
    { label: "Pending", value: myApps.filter((a) => a.status === "pending").length, icon: Clock, color: "#f59e0b", bg: "#fffbeb" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-xl font-bold text-gray-800">Welcome, {student?.name}</h1>
          <p className="text-xs text-gray-400 mt-0.5">Here's your placement overview</p>
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

        {/* Recent Job Openings */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Recent Job Openings</h2>
          <div className="space-y-2">
            {activeJobs.slice(0, 3).map((job) => {
              const applied = myApps.some((a) => a.jobId === job.id);
              return (
                <Link
                  key={job.id}
                  to="/student/jobs"
                  className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: TEAL }}
                    >
                      {job.companyName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{job.role}</p>
                      <p className="text-xs text-gray-400">{job.companyName} · {job.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className="text-xs"
                      style={applied
                        ? { background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" }
                        : { background: TEAL, color: "#fff", border: "none" }
                      }
                    >
                      {applied ? "Applied" : "Open"}
                    </Badge>
                    <span className="text-xs text-gray-400 hidden sm:block">
                      Due {formatDeadline(job.deadline)}
                    </span>
                  </div>
                </Link>
              );
            })}
            {activeJobs.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">No active job openings at the moment.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
