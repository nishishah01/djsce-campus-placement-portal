import { useJobs, useApplications, useStudents } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users, CheckCircle, Building2 } from "lucide-react";

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome, {userName || "Coordinator"}</h1>
          <p className="text-muted-foreground">Overview of all placement activities</p>
        </div>

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

        <Card className="glass-card">
          <CardContent className="p-5">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Company-wise Applications</h2>
            <div className="space-y-3">
              {jobs.map((job) => {
                const apps = applications.filter((a) => a.jobId === job.id);
                return (
                  <div key={job.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium text-foreground">{job.companyName}</p>
                      <p className="text-sm text-muted-foreground">{job.role}</p>
                    </div>
                    <div className="text-right">
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
