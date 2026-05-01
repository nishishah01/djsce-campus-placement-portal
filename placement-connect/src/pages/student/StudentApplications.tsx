import { useJobs, useApplications } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#fffbeb", color: "#d97706" },
  shortlisted: { bg: "#eff6ff", color: "#3b82f6" },
  accepted: { bg: "#ecfdf5", color: "#10b981" },
  rejected: { bg: "#fef2f2", color: "#ef4444" },
};

export default function StudentApplications() {
  const { userId } = useAuth();
  const { data: applications = [] } = useApplications();
  const { data: jobs = [] } = useJobs();
  const myApps = applications.filter((a) => a.studentId === userId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">My Applications</h1>
          <p className="text-xs text-gray-400 mt-0.5">{myApps.length} total applications</p>
        </div>

        {myApps.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-12 text-center text-gray-400 text-sm">
            You haven't applied to any jobs yet.
          </div>
        ) : (
          <div className="space-y-3">
            {myApps.map((app) => {
              const job = jobs.find((j) => j.id === app.jobId);
              if (!job) return null;
              const sc = statusColors[app.status] ?? { bg: "#f3f4f6", color: "#6b7280" };
              return (
                <div key={app.id} className="bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ background: "#2cb5a0" }}
                      >
                        {job.companyName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{job.role}</p>
                        <p className="text-xs text-gray-400">{job.companyName} · {job.location}</p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          Applied on {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
