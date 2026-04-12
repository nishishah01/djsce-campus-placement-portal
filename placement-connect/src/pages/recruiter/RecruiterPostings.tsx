import { useJobs, useApplications, useStudents } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Users } from "lucide-react";

export default function RecruiterPostings() {
  const { userId } = useAuth();
  const { data: jobs = [] } = useJobs();
  const { data: applications = [] } = useApplications();
  const { data: students = [] } = useStudents();
  const myJobs = jobs.filter((j) => j.postedBy === userId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">My Job Postings</h1>

        {myJobs.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center text-muted-foreground">No jobs posted yet.</CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {myJobs.map((job) => {
              const apps = applications.filter((a) => a.jobId === job.id);
              return (
                <AccordionItem key={job.id} value={job.id} className="glass-card rounded-xl border px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div>
                        <p className="font-semibold text-foreground">{job.role}</p>
                        <p className="text-sm text-muted-foreground">{job.companyName} · {job.location}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-auto mr-2 flex items-center gap-1">
                      <Users className="h-3 w-3" /> {apps.length}
                    </Badge>
                  </AccordionTrigger>
                  <AccordionContent>
                    {apps.length === 0 ? (
                      <p className="py-4 text-sm text-muted-foreground">No applicants yet.</p>
                    ) : (
                      <div className="space-y-2 pb-2">
                        {apps.map((app) => {
                          const student = students.find((s) => s.id === app.studentId);
                          return (
                            <div key={app.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                              <div>
                                <p className="font-medium text-foreground">{student?.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {student?.department} · CGPA: {student?.cgpa} · SAP: {student?.sapId}
                                </p>
                              </div>
                              <Badge variant="outline">{app.status}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </DashboardLayout>
  );
}
