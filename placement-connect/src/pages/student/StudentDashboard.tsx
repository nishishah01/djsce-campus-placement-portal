import { useJobs, useApplications, useStudents } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, FileText, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  const { userId } = useAuth();
  const { data: jobs = [] } = useJobs();
  const { data: applications = [] } = useApplications();
  const { data: students = [] } = useStudents();
  const student = students.find((s) => s.id === userId);
  const myApps = applications.filter((a) => a.studentId === userId);
  const activeJobs = jobs.filter((j) => new Date(j.deadline) >= new Date());

  const stats = [
    { label: "Active Jobs", value: activeJobs.length, icon: Briefcase, color: "text-primary" },
    { label: "Applications", value: myApps.length, icon: FileText, color: "text-info" },
    { label: "Shortlisted", value: myApps.filter((a) => a.status === "shortlisted").length, icon: CheckCircle, color: "text-success" },
    { label: "Pending", value: myApps.filter((a) => a.status === "pending").length, icon: Clock, color: "text-warning" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome, {student?.name}</h1>
          <p className="text-muted-foreground">Here's your placement overview</p>
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
          <CardHeader>
            <CardTitle className="text-lg">Recent Job Openings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeJobs.slice(0, 3).map((job) => {
              const applied = myApps.some((a) => a.jobId === job.id);
              return (
                <Link
                  key={job.id}
                  to="/student/jobs"
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-semibold text-foreground">{job.role}</p>
                    <p className="text-sm text-muted-foreground">{job.companyName} · {job.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={applied ? "secondary" : "default"}>
                      {applied ? "Applied" : "Open"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Due {new Date(job.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
