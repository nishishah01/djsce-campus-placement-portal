import DashboardLayout from "@/components/DashboardLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useApplications, useJobs, useStudents, useUpdateApplication } from "@/hooks/useApi";
import { Download, Users } from "lucide-react";

export default function RecruiterPostings() {
  const { userId } = useAuth();
  const { data: jobs = [] } = useJobs();
  const { data: applications = [] } = useApplications();
  const { data: students = [] } = useStudents();
  const { mutate: updateApplication } = useUpdateApplication();
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
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {apps.length}
                      </Badge>
                      {apps.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`http://127.0.0.1:8000/api/jobs/${job.id}/download_applications/`, '_blank');
                          }}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          CSV
                        </Button>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {apps.length === 0 ? (
                      <p className="py-4 text-sm text-muted-foreground">No applicants yet.</p>
                    ) : (
                      <div className="space-y-2 pb-2">
                        {apps.map((app) => {
                          const student = students.find((s) => s.id === app.studentId);
                          return (
                            <div key={app.id} className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-medium text-foreground">{student?.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {student?.department} · CGPA: {student?.cgpa} · SAP: {student?.sapId}
                                </p>
                                {app.customResume ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2 px-2"
                                    onClick={() => window.open(app.customResume, '_blank')}
                                  >
                                    Download Company Resume
                                  </Button>
                                ) : (
                                  <p className="mt-2 text-xs text-muted-foreground">No company-specific resume uploaded.</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{app.status}</Badge>
                                {app.status === 'pending' && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateApplication({ id: app.id, data: { status: 'shortlisted' } })}
                                    >
                                      Shortlist
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => updateApplication({ id: app.id, data: { status: 'rejected' } })}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </div>
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
