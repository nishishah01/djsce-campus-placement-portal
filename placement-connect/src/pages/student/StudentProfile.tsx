import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useStudents, useUpdateStudent } from "@/hooks/useApi";
import { BookOpen, Calendar, FileText, Hash, Mail, Upload, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function StudentProfile() {
  const { userId } = useAuth();
  const { data: students = [] } = useStudents();
  const { mutate: updateStudent } = useUpdateStudent();
  const student = students.find((s) => s.id === userId);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleResumeUpload = () => {
    if (!resumeFile || !userId) return;

    const formData = new FormData();
    // Add all existing student data
    Object.entries(student).forEach(([key, value]) => {
      if (value !== null && value !== undefined && key !== 'resumeUrl') {
        formData.append(key, value as string);
      }
    });
    formData.append('resumeUrl', resumeFile);

    updateStudent({ id: userId, data: formData }, {
      onSuccess: () => {
        setResumeFile(null);
        toast.success("Resume uploaded successfully!");
      },
      onError: () => {
        toast.error("Failed to upload resume. Please try again.");
      }
    });
  };

  const fields = [
    { label: "Full Name", value: student.name, icon: User },
    { label: "SAP ID", value: student.sapId, icon: Hash },
    { label: "Email", value: student.email, icon: Mail },
    { label: "Department", value: student.department, icon: BookOpen },
    { label: "Date of Birth", value: new Date(student.dob).toLocaleDateString(), icon: Calendar },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((f) => (
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

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Resume</CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="h-3 w-3" /> {student.resumeUrl ? "Uploaded" : "Not Uploaded"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your default resume will be shared with recruiters. You can upload a custom resume per application.
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
                  <span className="text-sm text-muted-foreground">Selected: {resumeFile.name}</span>
                  <Button onClick={handleResumeUpload} size="sm" className="flex items-center gap-2">
                    <Upload className="h-3 w-3" /> Upload
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
