import { useStudents } from "@/hooks/useApi";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function CoordinatorStudents() {
  const [search, setSearch] = useState("");
  const { data: students = [] } = useStudents();

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.sapId.includes(search) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-foreground">Registered Students</h1>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <Card className="glass-card overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SAP ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>10th %</TableHead>
                  <TableHead>12th %</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.sapId}</TableCell>
                    <TableCell>{s.department}</TableCell>
                    <TableCell>{s.score10th}</TableCell>
                    <TableCell>{s.score12th}</TableCell>
                    <TableCell>{s.cgpa}</TableCell>
                    <TableCell className="text-muted-foreground">{s.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
