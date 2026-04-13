import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateJob } from "@/hooks/useApi";
import { useState } from "react";
import { toast } from "sonner";

const departments = [
  "Computer Engineering",
  "Information Technology",
  "CSE-DS",
  "AIML",
  "AIDS",
  "IOT",
  "Mechanical",
  "EXTC",
];

export default function RecruiterPostJob() {
  const [form, setForm] = useState({
    companyName: "",
    role: "",
    stipend: "",
    location: "",
    type: "Full-Time",
    deadline: "",
    description: "",
    jdUrl: "",
    jdPdf: null as File | null,
    eligibleDepartments: [] as string[],
  });
  const [jdType, setJdType] = useState<"text" | "upload">("text");

  const toggleDept = (dept: string) => {
    setForm((prev) => ({
      ...prev,
      eligibleDepartments: prev.eligibleDepartments.includes(dept)
        ? prev.eligibleDepartments.filter((d) => d !== dept)
        : [...prev.eligibleDepartments, dept],
    }));
  };

  const { userId } = useAuth();
  const { mutate: createJob } = useCreateJob();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("You must be logged in to post a job.");
      return;
    }

    const jobData = {
      id: `j${Date.now()}`,
      companyName: form.companyName,
      role: form.role,
      stipend: form.stipend,
      location: form.location,
      type: form.type,
      deadline: form.deadline,
      description: form.description,
      jdUrl: form.jdUrl,
      postedBy: userId,
      postedAt: new Date().toISOString().split("T")[0],
      eligibleDepartments: form.eligibleDepartments,
    };

    let dataToSend: any = jobData;
    if (form.jdPdf) {
      const formData = new FormData();
      formData.append('id', jobData.id);
      formData.append('companyName', jobData.companyName);
      formData.append('role', jobData.role);
      formData.append('stipend', jobData.stipend);
      formData.append('location', jobData.location);
      formData.append('type', jobData.type);
      formData.append('deadline', jobData.deadline);
      formData.append('description', jobData.description || '');
      formData.append('jdUrl', jobData.jdUrl || '');
      formData.append('postedBy', jobData.postedBy);
      formData.append('postedAt', jobData.postedAt);
      formData.append('eligibleDepartments', JSON.stringify(jobData.eligibleDepartments));
      formData.append('jdPdf', form.jdPdf);
      dataToSend = formData;
    }

    createJob(dataToSend, {
      onSuccess: () => {
        toast.success("Job posted successfully!");
        setForm({ companyName: "", role: "", stipend: "", location: "", type: "Full-Time", deadline: "", description: "", jdUrl: "", jdPdf: null, eligibleDepartments: [] });
        setJdType("text");
      },
      onError: () => {
        toast.error("Failed to post job. Please try again.");
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Post a New Job</h1>

        <Card className="glass-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Company Name</Label>
                  <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
                </div>
                <div>
                  <Label>Role / Position</Label>
                  <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>Stipend / CTC</Label>
                  <Input value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} placeholder="₹50,000/month" required />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
                </div>
                <div>
                  <Label>Job Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-Time">Full-Time</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Part-Time">Part-Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Application Deadline</Label>
                <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
              </div>
              <div className="rounded-md border border-border p-4 bg-muted/20">
                <Label className="mb-3 block text-base font-semibold">Job Description Format</Label>
                <div className="mb-4 flex gap-4">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="radio" name="jdType" checked={jdType === "text"} onChange={() => setJdType("text")} className="cursor-pointer" />
                    <span className="text-sm">Write Text Description</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="radio" name="jdType" checked={jdType === "upload"} onChange={() => setJdType("upload")} className="cursor-pointer" />
                    <span className="text-sm">Upload PDF</span>
                  </label>
                </div>

                {jdType === "text" ? (
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value, jdUrl: "", jdPdf: null })} rows={4} placeholder="Enter detailed job description..." required={jdType === "text"} />
                ) : (
                  <Input type="file" accept=".pdf" onChange={(e) => setForm({ ...form, jdPdf: e.target.files?.[0] || null, description: "", jdUrl: "" })} required={jdType === "upload"} />
                )}
              </div>
              <div>
                <Label className="mb-2 block">Eligible Departments</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {departments.map((dept) => (
                    <label key={dept} className="flex items-center gap-2 rounded-md border border-border p-2 text-sm cursor-pointer hover:bg-muted/50">
                      <Checkbox
                        checked={form.eligibleDepartments.includes(dept)}
                        onCheckedChange={() => toggleDept(dept)}
                      />
                      {dept}
                    </label>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">Post Job</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
