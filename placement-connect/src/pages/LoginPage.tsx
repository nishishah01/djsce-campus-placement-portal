import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Briefcase, Shield } from "lucide-react";
import { Role, useStudents, useCreateStudent, useRecruiters, useCreateRecruiter } from "@/hooks/useApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const roles: { role: Role; label: string; desc: string; icon: typeof GraduationCap; path: string }[] = [
  { role: "student", label: "Student", desc: "Browse jobs, apply & track applications", icon: GraduationCap, path: "/student" },
  { role: "recruiter", label: "Recruiter", desc: "Post openings & review applicants", icon: Briefcase, path: "/recruiter" },
  { role: "coordinator", label: "Coordinator", desc: "Manage placements & export data", icon: Shield, path: "/coordinator" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { data: students = [] } = useStudents();
  const { data: recruiters = [] } = useRecruiters();
  const { mutate: createStudent } = useCreateStudent();
  const { mutate: createRecruiter } = useCreateRecruiter();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    sapId: "",
    companyName: "",
    department: "",
    cgpa: "",
    password: "",
  });

  const handleRoleClick = (role: Role) => {
    setSelectedRole(role);
    setIsRegistering(false);
    setIdentifier("");
    setPassword("");
  };

  const submitLogin = () => {
    if (!identifier.trim()) {
      toast.error("Please enter an ID to login");
      return;
    }

    if (selectedRole === "student") {
      const student = students.find((s) => s.sapId === identifier || s.id === identifier || s.email === identifier);
      if (student) {
        login("student", student.id, student.name);
        toast.success(`Welcome back, ${student.name}!`);
        navigate("/student");
      } else {
        toast.error("Student profile not found. Try registering instead.");
      }
    } else if (selectedRole === "recruiter") {
      if (!identifier.trim() || !password.trim()) {
        toast.error("Please enter email and password");
        return;
      }
      const recruiter = recruiters.find((r: any) => r.email === identifier.trim());
      if (recruiter && recruiter.password === password) {
        login("recruiter", recruiter.id);
        toast.success(`Logged in as Recruiter: ${recruiter.companyName}`);
        navigate("/recruiter");
      } else {
        toast.error("Invalid email or password. Try registering instead.");
      }
    } else if (selectedRole === "coordinator") {
      if (!password.trim()) {
        toast.error("Please enter the coordinator password");
        return;
      }
      fetch("/coordinators.csv")
        .then((res) => {
          if (!res.ok) throw new Error("Could not load CSV");
          return res.text();
        })
        .then((text) => {
          const lines = text.split("\n").filter((line) => line.trim());
          let isValid = false;
          let coordName = "Coordinator";
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(",");
            if (cols.length >= 5) {
              const sapId = cols[2]?.trim();
              const authPass = cols[4]?.trim();
              if (sapId === identifier && authPass === password) {
                isValid = true;
                coordName = cols[0]?.trim();
                break;
              }
            }
          }
          if (isValid) {
            login("coordinator", identifier, coordName);
            toast.success(`Logged in as Coordinator: ${coordName}`);
            navigate("/coordinator");
          } else {
            toast.error("Invalid Coordinator SAP ID or Password");
          }
        })
        .catch(() => {
          toast.error("Error reading coordinator credentials");
        });
    }
  };

  const submitRegistration = () => {
    if (selectedRole === "student") {
      if (!regForm.name || !regForm.email || !regForm.sapId || !regForm.cgpa) {
        toast.error("Please fill all required student fields.");
        return;
      }

      const newStudent = {
        id: `s_live_${Date.now()}`,
        name: regForm.name,
        sapId: regForm.sapId,
        email: regForm.email,
        department: regForm.department || "General",
        dob: "2000-01-01",
        score10th: 80,
        score12th: 80,
        cgpa: parseFloat(regForm.cgpa),
        resumeUrl: "",
      };

      createStudent(newStudent, {
        onSuccess: () => {
          toast.success(`Account created successfully! Welcome ${newStudent.name}`);
          login("student", newStudent.id, newStudent.name);
          navigate("/student");
        },
        onError: () => {
          toast.error("Failed to create account. Please try again.");
        }
      });
    } else if (selectedRole === "recruiter") {
      if (!regForm.name || !regForm.email || !regForm.companyName || !regForm.password) {
        toast.error("Please fill all required recruiter fields including password.");
        return;
      }

      const newRecruiter = {
        id: `r_live_${Date.now()}`,
        recruiterName: regForm.name,
        companyName: regForm.companyName,
        email: regForm.email,
        password: regForm.password,
      };

      createRecruiter(newRecruiter, {
        onSuccess: () => {
          toast.success(`Recruiter account created successfully! Welcome to PlaceHub.`);
          login("recruiter", newRecruiter.id);
          navigate("/recruiter");
        },
        onError: () => {
          toast.error("Failed to create account. Please try again.");
        }
      });
    }
  };

  return (
    <div className="dark relative flex min-h-screen flex-col items-center justify-center bg-black px-4 text-foreground pt-32">
      <div className="absolute left-0 top-0 w-full border-b border-white/10 bg-black py-4">
        <img src="https://www.djsce.ac.in/images/djsce_logo.png" alt="DJSCE Logo" className="mx-auto w-full max-w-7xl h-auto object-contain" />
      </div>

      <div className="mb-10 text-center">
        <p className="mt-2 text-xl font-medium text-muted-foreground">Campus Placement Portal</p>
      </div>

      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {roles.map(({ role, label, desc, icon: Icon }) => (
          <button
            key={role}
            onClick={() => handleRoleClick(role)}
            className="group glass-card flex flex-col items-center gap-3 rounded-xl p-8 text-center transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{label}</h2>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </button>
        ))}
      </div>

      <Dialog open={!!selectedRole} onOpenChange={() => setSelectedRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isRegistering ? "Create Student Account" : `Login as ${selectedRole?.charAt(0).toUpperCase()}${selectedRole?.slice(1)}`}
            </DialogTitle>
          </DialogHeader>

          {isRegistering && (selectedRole === "student" || selectedRole === "recruiter") ? (
            <div className="space-y-4 py-4">
              {selectedRole === "student" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={regForm.name} onChange={(e) => setRegForm({...regForm, name: e.target.value})} placeholder="John Doe" />
                  </div>
                  <div>
                    <Label>SAP ID</Label>
                    <Input value={regForm.sapId} onChange={(e) => setRegForm({...regForm, sapId: e.target.value})} placeholder="500091..." />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={regForm.email} onChange={(e) => setRegForm({...regForm, email: e.target.value})} placeholder="john@uni.edu" />
                  </div>
                  <div>
                    <Label>CGPA</Label>
                    <Input type="number" step="0.1" value={regForm.cgpa} onChange={(e) => setRegForm({...regForm, cgpa: e.target.value})} placeholder="8.5" />
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label>Company Name</Label>
                    <Input value={regForm.companyName} onChange={(e) => setRegForm({...regForm, companyName: e.target.value})} placeholder="Tesla, Amazon, etc." />
                  </div>
                  <div>
                    <Label>Recruiter Name</Label>
                    <Input value={regForm.name} onChange={(e) => setRegForm({...regForm, name: e.target.value})} placeholder="Jane Smith" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={regForm.email} onChange={(e) => setRegForm({...regForm, email: e.target.value})} placeholder="jane@company.com" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Password</Label>
                    <Input type="password" value={regForm.password} onChange={(e) => setRegForm({...regForm, password: e.target.value})} placeholder="Enter Password" />
                  </div>
                </div>
              )}
              <DialogFooter className="mt-4 flex sm:justify-between items-center">
                <Button variant="link" onClick={() => setIsRegistering(false)} className="px-0">Back to Login</Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedRole(null)}>Cancel</Button>
                  <Button onClick={submitRegistration}>Register & Login</Button>
                </div>
              </DialogFooter>
            </div>
          ) : (
            <>
              <DialogDescription>
                {selectedRole === "student" && "Enter your SAP ID, Email, or Profile ID to log in."}
                {selectedRole === "recruiter" && "Enter your Email and Password to log in."}
                {selectedRole === "coordinator" && "Enter your Coordinator SAP ID and Password to log in."}
              </DialogDescription>
              <div className="py-4 space-y-4">
                <div>
                  <Label>{selectedRole === "coordinator" ? "SAP ID" : selectedRole === "recruiter" ? "Email" : "Identifier"}</Label>
                  <Input
                    autoFocus
                    placeholder={selectedRole === "student" ? "e.g. 500091234 or email" : selectedRole === "coordinator" ? "Enter your SAP ID" : "Enter your Email"}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && selectedRole !== "coordinator" && submitLogin()}
                  />
                </div>
                {(selectedRole === "coordinator" || selectedRole === "recruiter") && (
                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      placeholder={selectedRole === "coordinator" ? "Enter Access Password" : "Enter Password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitLogin()}
                    />
                  </div>
                )}
                
                
                {(selectedRole === "student" || selectedRole === "recruiter") && (
                  <div className="mt-4 text-center">
                    <span className="text-sm text-muted-foreground">Don't have an account? </span>
                    <Button variant="link" className="px-1 py-0 h-auto" onClick={() => setIsRegistering(true)}>Register here</Button>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedRole(null)}>Cancel</Button>
                <Button onClick={submitLogin}>Secure Login</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
