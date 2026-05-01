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
    deadlineTime: "23:59",
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

    // Combine date + time into one deadline string (stored as "YYYY-MM-DD HH:MM IST")
    const deadlineCombined = form.deadlineTime
      ? `${form.deadline} ${form.deadlineTime} IST`
      : form.deadline;

    const jobData = {
      id: `j${Date.now()}`,
      companyName: form.companyName,
      role: form.role,
      stipend: form.stipend,
      location: form.location,
      type: form.type,
      deadline: deadlineCombined,
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
      formData.append('deadline', deadlineCombined);
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
        setForm({ companyName: "", role: "", stipend: "", location: "", type: "Full-Time", deadline: "", deadlineTime: "23:59", description: "", jdUrl: "", jdPdf: null, eligibleDepartments: [] });
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
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">Post a New Job</h1>
          <p className="text-xs text-gray-400 mt-0.5">Fill in the details to publish an opening</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-6">
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
                <Label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Application Deadline
                  <span className="ml-1.5 text-xs font-normal text-gray-400">(IST)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    required
                    className="flex-1"
                  />
                  <div className="relative flex-shrink-0 w-36">
                    <Input
                      type="time"
                      value={form.deadlineTime}
                      onChange={(e) => setForm({ ...form, deadlineTime: e.target.value })}
                      className="pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">
                      IST
                    </span>
                  </div>
                </div>
                {form.deadline && form.deadlineTime && (
                  <p className="mt-1 text-xs text-teal-600">
                    Deadline: {new Date(`${form.deadline}T${form.deadlineTime}`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}{" at "}
                    {new Date(`${form.deadline}T${form.deadlineTime}`).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })} IST
                  </p>
                )}
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <Label className="mb-3 block text-sm font-semibold text-gray-700">Job Description Format</Label>
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
              <button
                type="submit"
                className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all"
                style={{ background: "#2cb5a0" }}
              >
                Post Job
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
