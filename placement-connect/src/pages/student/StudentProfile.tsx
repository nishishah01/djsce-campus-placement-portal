import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useStudents, useUpdateStudent } from "@/hooks/useApi";
import {
  BookOpen,
  Calendar,
  FileText,
  Hash,
  Mail,
  Pencil,
  Upload,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const DEPARTMENTS = [
  "Computer Engineering",
  "Information Technology",
  "Electronics & Telecommunication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biomedical Engineering",
  "Automobile Engineering",
];

export default function StudentProfile() {
  const { userId } = useAuth();
  const { data: students = [] } = useStudents();
  const { mutate: updateStudent, isPending } = useUpdateStudent();
  const student = students.find((s) => s.id === userId);

  // ── Resume state ──────────────────────────────────────────────────────────
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // ── Edit modal state ───────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sapId: "",
    dob: "",
    department: "",
    score10th: "",
    score12th: "",
    cgpa: "",
  });

  // Populate form when student data arrives
  useEffect(() => {
    if (student) {
      setForm({
        name: student.name ?? "",
        sapId: student.sapId ?? "",
        dob: student.dob ?? "",
        department: student.department ?? "",
        score10th: String(student.score10th ?? ""),
        score12th: String(student.score12th ?? ""),
        cgpa: String(student.cgpa ?? ""),
      });
    }
  }, [student]);

  if (!student) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          Loading profile…
        </div>
      </DashboardLayout>
    );
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleField = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSaveProfile = () => {
    if (!userId) return;

    const payload: Record<string, any> = {
      // always send non-editable fields to satisfy PUT (if needed, we use PATCH so this is fine)
      id: student.id,
      email: student.email,
      password: student.password ?? "password123",
      // editable fields
      name: form.name.trim(),
      sapId: form.sapId.trim(),
      dob: form.dob,
      department: form.department,
      score10th: parseFloat(form.score10th),
      score12th: parseFloat(form.score12th),
      cgpa: parseFloat(form.cgpa),
    };

    updateStudent(
      { id: userId, data: payload },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Profile updated successfully!");
        },
        onError: () => {
          toast.error("Failed to update profile. Please try again.");
        },
      }
    );
  };

  const handleResumeUpload = () => {
    if (!resumeFile || !userId) return;

    const formData = new FormData();
    Object.entries(student).forEach(([key, value]) => {
      if (value !== null && value !== undefined && key !== "resumeUrl") {
        formData.append(key, value as string);
      }
    });
    formData.append("resumeUrl", resumeFile);

    updateStudent(
      { id: userId, data: formData },
      {
        onSuccess: () => {
          setResumeFile(null);
          toast.success("Resume uploaded successfully!");
        },
        onError: () => {
          toast.error("Failed to upload resume. Please try again.");
        },
      }
    );
  };

  const infoFields = [
    { label: "Full Name", value: student.name, icon: User },
    { label: "SAP ID", value: student.sapId, icon: Hash },
    { label: "Email", value: student.email, icon: Mail },
    { label: "Department", value: student.department, icon: BookOpen },
    {
      label: "Date of Birth",
      value: new Date(student.dob).toLocaleDateString(),
      icon: Calendar,
    },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Profile
          </Button>
        </div>

        {/* SAP ID missing warning */}
        {!student.sapId && (
          <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
            ⚠️ <strong>SAP ID not set.</strong> Please edit your profile to add your SAP ID — it is required for application processing by recruiters and coordinators.
          </div>
        )}

        {/* ── Personal Details card ── */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {infoFields.map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <f.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{f.label}</p>
                  <p className="text-sm font-medium text-foreground">{f.value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Academic Scores card ── */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Academic Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg border border-border p-4">
                <p className="text-2xl font-bold text-foreground">{student.score10th}%</p>
                <p className="text-xs text-muted-foreground">10th Grade</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-2xl font-bold text-foreground">{student.score12th}%</p>
                <p className="text-xs text-muted-foreground">12th Grade</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-2xl font-bold text-primary">{student.cgpa}</p>
                <p className="text-xs text-muted-foreground">CGPA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Resume card ── */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Resume</CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {student.resumeUrl ? "Uploaded" : "Not Uploaded"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your default resume will be shared with recruiters. You can upload a
              custom resume per application.
            </p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="resume-upload">Upload New Resume</Label>
                <Input
                  id="resume-upload"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
              </div>
              {resumeFile && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Selected: {resumeFile.name}
                  </span>
                  <Button
                    onClick={handleResumeUpload}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-3 w-3" /> Upload
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          Edit Profile Modal
      ════════════════════════════════════════════════════════════════════ */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditing(false);
          }}
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-background p-8 shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setIsEditing(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-6 text-xl font-bold text-foreground">Edit Profile</h2>

            <div className="space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={form.name}
                  onChange={(e) => handleField("name", e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              {/* SAP ID */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-sapid">SAP ID</Label>
                <Input
                  id="edit-sapid"
                  value={form.sapId}
                  onChange={(e) => handleField("sapId", e.target.value)}
                  placeholder="e.g. 500091234"
                />
                <p className="text-xs text-muted-foreground">Your SAP ID is visible to recruiters and coordinators on your application.</p>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-dob">Date of Birth</Label>
                <Input
                  id="edit-dob"
                  type="date"
                  value={form.dob}
                  onChange={(e) => handleField("dob", e.target.value)}
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-department">Department</Label>
                <select
                  id="edit-department"
                  value={form.department}
                  onChange={(e) => handleField("department", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-colors"
                >
                  <option value="" disabled>
                    Select your department
                  </option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Scores row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-10th">10th Score (%)</Label>
                  <Input
                    id="edit-10th"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.score10th}
                    onChange={(e) => handleField("score10th", e.target.value)}
                    placeholder="e.g. 85.5"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-12th">12th Score (%)</Label>
                  <Input
                    id="edit-12th"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.score12th}
                    onChange={(e) => handleField("score12th", e.target.value)}
                    placeholder="e.g. 82.0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-cgpa">CGPA</Label>
                  <Input
                    id="edit-cgpa"
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value={form.cgpa}
                    onChange={(e) => handleField("cgpa", e.target.value)}
                    placeholder="e.g. 8.5"
                  />
                </div>
              </div>

              {/* Read-only notice */}
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Contact your placement coordinator for corrections.
              </p>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditing(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSaveProfile}
                  disabled={isPending}
                >
                  {isPending ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
