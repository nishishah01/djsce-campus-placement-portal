import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useApplications, useCreateApplication, useJobs } from "@/hooks/useApi";
import { Calendar, IndianRupee, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function StudentJobs() {
  const { userId } = useAuth();
  const [search, setSearch] = useState("");
  const [applyJobId, setApplyJobId] = useState<string | null>(null);
  const [coverNote, setCoverNote] = useState("");
  const [customResume, setCustomResume] = useState<File | null>(null);
  const { data: jobs = [] } = useJobs();
  const { data: applications = [] } = useApplications();
  const { mutate: createApplication } = useCreateApplication();

  const filteredJobs = jobs.filter(
    (j) =>
      j.companyName.toLowerCase().includes(search.toLowerCase()) ||
      j.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleApply = () => {
    if (!applyJobId || !userId) return;

    if (customResume) {
      // Handle file upload with FormData
      const formData = new FormData();
      formData.append('id', `a${Date.now()}`);
      formData.append('studentId', userId);
      formData.append('jobId', applyJobId);
      formData.append('appliedAt', new Date().toISOString().split("T")[0]);
      formData.append('status', 'pending');
      if (coverNote) formData.append('coverNote', coverNote);
      formData.append('customResume', customResume);

      createApplication(formData, {
        onSuccess: () => {
          setApplyJobId(null);
          setCoverNote("");
          setCustomResume(null);
          toast.success("Application submitted successfully!");
        }
      });
    } else {
      const newApp = {
        id: `a${Date.now()}`,
        studentId: userId,
        jobId: applyJobId,
        appliedAt: new Date().toISOString().split("T")[0],
        status: "pending" as const,
        coverNote,
      };
      createApplication(newApp, {
        onSuccess: () => {
          setApplyJobId(null);
          setCoverNote("");
          setCustomResume(null);
          toast.success("Application submitted successfully!");
        }
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-foreground">Job Openings</h1>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search companies or roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredJobs.map((job) => {
            const applied = applications.some((a) => a.jobId === job.id && a.studentId === userId);
            return (
              <Card key={job.id} className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{job.role}</CardTitle>
                      <p className="text-sm font-medium text-primary">{job.companyName}</p>
                    </div>
                    <Badge variant={job.type === "Internship" ? "outline" : "default"}>{job.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                    <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" />{job.stipend}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Due {new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {job.eligibleDepartments.map((d) => (
                      <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    disabled={applied}
                    onClick={() => setApplyJobId(job.id)}
                  >
                    {applied ? "Already Applied" : "Apply Now"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={!!applyJobId} onOpenChange={() => setApplyJobId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for {jobs.find((j) => j.id === applyJobId)?.role}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            at {jobs.find((j) => j.id === applyJobId)?.companyName}
          </DialogDescription>
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Personalized Resume (optional)</Label>
              <div className="rounded-lg border border-dashed border-border p-4 text-center">
                {customResume ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{customResume.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => setCustomResume(null)}>Remove</Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => setCustomResume(e.target.files?.[0] || null)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Click to upload a company-specific resume
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">PDF, DOC, DOCX · Your default resume is used if skipped</p>
                  </label>
                )}
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Cover Note (optional)</Label>
              <Textarea
                placeholder="Why are you a great fit for this role?"
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyJobId(null)}>Cancel</Button>
            <Button onClick={handleApply}>Submit Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
