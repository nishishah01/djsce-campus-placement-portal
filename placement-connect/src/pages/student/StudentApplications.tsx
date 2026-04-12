import { useJobs, useApplications } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  shortlisted: "bg-info/10 text-info border-info/20",
  accepted: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function StudentApplications() {
  const { userId } = useAuth();
  const { data: applications = [] } = useApplications();
  const { data: jobs = [] } = useJobs();
  const myApps = applications.filter((a) => a.studentId === userId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">My Applications</h1>

        {myApps.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center text-muted-foreground">
              You haven't applied to any jobs yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {myApps.map((app) => {
              const job = jobs.find((j) => j.id === app.jobId);
              if (!job) return null;
              return (
                <Card key={app.id} className="glass-card">
                  <CardContent className="flex items-center justify-between p-5">
                    <div>
                      <p className="font-semibold text-foreground">{job.role}</p>
                      <p className="text-sm text-muted-foreground">{job.companyName} · {job.location}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Applied on {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={statusColors[app.status]} variant="outline">
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
