import { useJobs, useApplications, useStudents } from "@/hooks/useApi";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users, FileText, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function RecruiterDashboard() {
  const { userId } = useAuth();
  const { data: jobs = [] } = useJobs();
  const { data: applications = [] } = useApplications();
  const { data: students = [] } = useStudents();
  const myJobs = jobs.filter((j) => j.postedBy === userId);
  const myJobIds = myJobs.map((j) => j.id);
  const applicants = applications.filter((a) => myJobIds.includes(a.jobId));

  const stats = [
    { label: "Jobs Posted", value: myJobs.length, icon: Briefcase, color: "text-primary" },
    { label: "Total Applicants", value: applicants.length, icon: Users, color: "text-info" },
    { label: "Shortlisted", value: applicants.filter((a) => a.status === "shortlisted").length, icon: TrendingUp, color: "text-success" },
    { label: "Pending Review", value: applicants.filter((a) => a.status === "pending").length, icon: FileText, color: "text-warning" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recruiter Dashboard</h1>
          <p className="text-muted-foreground">Manage your job postings and review applicants</p>
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
            <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Applicants</h2>
            <div className="space-y-3">
              {applicants.slice(0, 5).map((app) => {
                const student = students.find((s) => s.id === app.studentId);
                const job = jobs.find((j) => j.id === app.jobId);
                return (
                  <div key={app.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium text-foreground">{student?.name}</p>
                      <p className="text-sm text-muted-foreground">{job?.role} · {student?.department}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(app.appliedAt).toLocaleDateString()}</span>
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
