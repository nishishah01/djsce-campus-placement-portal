import DashboardLayout from "@/components/DashboardLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useApplications, useJobs, useStudents, useUpdateApplication } from "@/hooks/useApi";
import { Download, Users, TrendingUp, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function RecruiterPostings() {
  const { userId } = useAuth();
  const { data: jobs = [] } = useJobs();
  const { data: applications = [] } = useApplications();
  const { data: students = [] } = useStudents();
  const { mutate: updateApplication } = useUpdateApplication();
  const myJobs = jobs.filter((j) => j.postedBy === userId);

  const [atsRankings, setAtsRankings] = useState<Record<string, any[]>>({});
  const [isRanking, setIsRanking] = useState<string | null>(null);

  const handleRankApplicants = async (jobId: string, apps: any[]) => {
    const fileInput = document.getElementById(`jdFile-${jobId}`) as HTMLInputElement;
    if (!fileInput?.files?.[0]) {
      alert("Please upload the Job Description PDF/DOCX first.");
      return;
    }

    const applicantsList = apps.map((app) => {
      const student = students.find((s) => s.id === app.studentId);
      return {
        id: app.id,
        name: student?.name || "Unknown",
        resumeUrl: app.customResume || student?.resumeUrl || ""
      };
    }).filter(a => a.resumeUrl);

    if (applicantsList.length === 0) {
      alert("No resumes found to rank.");
      return;
    }

    setIsRanking(jobId);
    try {
      const formData = new FormData();
      formData.append("job_description_file", fileInput.files[0]);
      formData.append("applicants", JSON.stringify(applicantsList));

      // Hit the ATS API on port 8081
      const res = await fetch("http://127.0.0.1:8081/api/rank", { method: "POST", body: formData });

      if (!res.ok) throw new Error("Ranking failed. Ensure ATS Server is running on port 8081 and CORS is enabled.");
      const data = await res.json();
      setAtsRankings(prev => ({ ...prev, [jobId]: data.rankings }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsRanking(null);
    }
  };

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
                      <div className="space-y-4 pb-2">
                        {/* ATS Ranker Inline Section */}
                        <div className="flex flex-col gap-3 p-4 rounded-lg border border-indigo-100 bg-indigo-50/50">
                          <div className="flex items-center gap-2 text-indigo-700">
                            <TrendingUp className="h-5 w-5" />
                            <h4 className="font-semibold">Rank Candidates via ATS</h4>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                            <div className="flex-1">
                              <label htmlFor={`jdFile-${job.id}`} className="text-xs font-medium mb-1 block text-muted-foreground">
                                Upload original JD (PDF/DOCX)
                              </label>
                              <input type="file" id={`jdFile-${job.id}`} className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" accept=".pdf,.docx" />
                            </div>
                            <Button 
                              onClick={() => handleRankApplicants(job.id, apps)}
                              disabled={isRanking === job.id}
                              className="mt-4 sm:mt-0"
                            >
                              {isRanking === job.id ? "Analyzing..." : "Analyze & Rank Top 10"}
                            </Button>
                          </div>
                          {atsRankings[job.id] && (
                            <div className="mt-2 text-sm text-emerald-600 flex items-center gap-1 font-medium z-10 relative">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                              Candidates successfully ranked! Check scores below.
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                        {(() => {
                           let displayApps = [...apps];
                           const rankings = atsRankings[job.id];
                           if (rankings) {
                              const rankedIds = rankings.map((r: any) => r.id);
                              // Sort by rank order
                              displayApps = displayApps.sort((a, b) => {
                                const rankA = rankedIds.indexOf(a.id);
                                const rankB = rankedIds.indexOf(b.id);
                                if (rankA === -1 && rankB === -1) return 0;
                                if (rankA === -1) return 1;
                                if (rankB === -1) return -1;
                                return rankA - rankB;
                              });
                           }
                           return displayApps.map((app) => {
                             const student = students.find((s) => s.id === app.studentId);
                             const rankData = rankings?.find((r: any) => r.id === app.id);
                             return (
                            <div key={app.id} className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-foreground">{student?.name}</p>
                                  {rankData && (
                                    <Badge variant={rankData.score >= 50 ? "default" : "destructive"} className="ml-2">
                                      ATS Score: {rankData.score}%
                                    </Badge>
                                  )}
                                  {rankData?.error && (
                                    <Badge variant="destructive" className="ml-2" title={rankData.error}>
                                      <AlertCircle className="h-3 w-3 mr-1"/> Error
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
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
                                ) : student?.resumeUrl ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2 px-2"
                                    onClick={() => window.open(student.resumeUrl, '_blank')}
                                  >
                                    Download Default Resume
                                  </Button>
                                ) : (
                                  <p className="mt-2 text-xs text-muted-foreground">No resume uploaded.</p>
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
                         }); // Close the displayApps.map function
                        })()}
                        </div>
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
