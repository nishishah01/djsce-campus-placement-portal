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
          <div>
            <h1 className="text-xl font-bold text-gray-800">Registered Students</h1>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} students found</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-gray-200 focus:border-teal-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SAP ID</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">10th %</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">12th %</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CGPA</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-800">{s.name}</TableCell>
                    <TableCell className="text-gray-500">{s.sapId}</TableCell>
                    <TableCell className="text-gray-500">{s.department}</TableCell>
                    <TableCell className="text-gray-500">{s.score10th}</TableCell>
                    <TableCell className="text-gray-500">{s.score12th}</TableCell>
                    <TableCell className="text-gray-500">{s.cgpa}</TableCell>
                    <TableCell className="text-gray-400">{s.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
