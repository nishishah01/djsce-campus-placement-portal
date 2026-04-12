import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApplications, useJobs, useStudents } from "@/hooks/useApi";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  shortlisted: "bg-info/10 text-info border-info/20",
  accepted: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function CoordinatorApplications() {
  const [filterCompany, setFilterCompany] = useState("all");

  const { data: jobs = [] } = useJobs();
  const { data: applications = [] } = useApplications();
  const { data: students = [] } = useStudents();

  const companies = Array.from(new Set(jobs.map((j) => j.companyName)));

  const filteredApps = filterCompany === "all"
    ? applications
    : applications.filter((a) => {
      const job = jobs.find((j) => j.id === a.jobId);
      return job?.companyName === filterCompany;
    });

  const exportToCSV = () => {
    const header = "Student Name,SAP ID,Department,CGPA,Company,Role,Status,Applied Date\n";
    const rows = filteredApps.map((app) => {
      const student = students.find((s) => s.id === app.studentId);
      const job = jobs.find((j) => j.id === app.jobId);
      return `"${student?.name}","${student?.sapId}","${student?.department}",${student?.cgpa},"${job?.companyName}","${job?.role}","${app.status}","${app.appliedAt}"`;
    }).join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applications_${filterCompany === "all" ? "all" : filterCompany}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-foreground">All Applications</h1>
          <div className="flex gap-3">
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        <Card className="glass-card overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>SAP ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.map((app) => {
                  const student = students.find((s) => s.id === app.studentId);
                  const job = jobs.find((j) => j.id === app.jobId);
                  return (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{student?.name}</TableCell>
                      <TableCell>{student?.sapId}</TableCell>
                      <TableCell>{student?.department}</TableCell>
                      <TableCell>{student?.cgpa}</TableCell>
                      <TableCell>{job?.companyName}</TableCell>
                      <TableCell>{job?.role}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[app.status]} variant="outline">
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{new Date(app.appliedAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
