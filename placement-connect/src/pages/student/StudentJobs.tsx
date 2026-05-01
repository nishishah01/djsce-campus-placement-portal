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
import { formatDeadline, isDeadlinePassed } from "@/lib/deadlineUtils";
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
      (j.companyName.toLowerCase().includes(search.toLowerCase()) ||
       j.role.toLowerCase().includes(search.toLowerCase()))
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
          <div>
            <h1 className="text-xl font-bold text-gray-800">Job Openings</h1>
            <p className="text-xs text-gray-400 mt-0.5">{filteredJobs.length} positions available</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search companies or roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-gray-200 focus:border-teal-400"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredJobs.map((job) => {
            const applied = applications.some((a) => a.jobId === job.id && a.studentId === userId);
            return (
              <div key={job.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                {/* Card header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ background: "#2cb5a0" }}
                    >
                      {job.companyName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{job.role}</p>
                      <p className="text-xs font-medium" style={{ color: "#2cb5a0" }}>{job.companyName}</p>
                    </div>
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={job.type === "Internship"
                      ? { background: "#eff6ff", color: "#3b82f6" }
                      : { background: "#e6f9f6", color: "#2cb5a0" }
                    }
                  >
                    {job.type}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 line-clamp-2">{job.description}</p>

                {/* JD PDF */}
                {job.jdPdf && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(job.jdPdf, '_blank')}
                    className="w-full border-gray-200 text-gray-600 hover:border-teal-400 hover:text-teal-600 text-xs"
                  >
                    View Job Description PDF
                  </Button>
                )}

                {/* Details row */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                  <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{job.stipend}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Due {formatDeadline(job.deadline)}</span>
                </div>

                {/* Eligible departments */}
                <div className="flex flex-wrap gap-1">
                  {job.eligibleDepartments.map((d) => (
                    <span key={d} className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{d}</span>
                  ))}
                </div>

                {/* Apply button */}
                <button
                  className="mt-1 w-full rounded-lg py-2.5 text-sm font-semibold transition-all"
                  style={applied
                    ? { background: "#f3f4f6", color: "#9ca3af", cursor: "not-allowed" }
                    : { background: "#2cb5a0", color: "#fff" }
                  }
                  disabled={applied}
                  onClick={() => setApplyJobId(job.id)}
                >
                  {applied ? "Already Applied" : "Apply Now"}
                </button>
              </div>
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
