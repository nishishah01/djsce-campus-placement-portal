import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Role, useCreateRecruiter, useCreateStudent, useRecruiters, useStudents } from "@/hooks/useApi";
import { Briefcase, GraduationCap, LogIn, Shield } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
      if (!password.trim()) {
        toast.error("Please enter your password.");
        return;
      }
      const student = students.find((s) => s.sapId === identifier || s.id === identifier || s.email === identifier);
      if (student && student.password === password) {
        login("student", student.id, student.name);
        toast.success(`Welcome back, ${student.name}!`);
        navigate("/student");
      } else if (student) {
        toast.error("Invalid password for this student account.");
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
        login("recruiter", recruiter.id, recruiter.recruiterName);
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
      if (!regForm.name || !regForm.email || !regForm.cgpa || !regForm.password) {
        toast.error("Please fill all required student fields including password.");
        return;
      }

      const newStudent = {
        id: `s_live_${Date.now()}`,
        name: regForm.name,
        sapId: "",
        email: regForm.email,
        department: regForm.department || "General",
        dob: "2000-01-01",
        score10th: 80,
        score12th: 80,
        cgpa: parseFloat(regForm.cgpa),
        password: regForm.password,
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
          login("recruiter", newRecruiter.id, newRecruiter.recruiterName);
          navigate("/recruiter");
        },
        onError: () => {
          toast.error("This email already exists. Please contact the coordinator to create an account.");
        }
      });
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f0f4f8]">
      {/* ── Top Header ── */}
      <header
        className="w-full flex items-center gap-4 px-6 py-4"
        style={{ background: "linear-gradient(135deg, hsl(170,65%,40%) 0%, hsl(170,65%,32%) 100%)" }}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
            <img
              src="/favicon.ico"
              alt="DJSCE"
              className="h-7 w-7 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight tracking-wide">DJSCE CAMPUS</p>
            <p className="text-white/70 text-xs leading-tight">Placement Portal</p>
          </div>
        </div>
        <div className="flex-1" />
        <img
          src="https://www.djsce.ac.in/images/djsce_logo.png"
          alt="DJSCE Logo"
          className="h-10 object-contain hidden sm:block"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </header>

      {/* ── Hero / main ── */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        {/* Heading */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Campus Placement Portal</h1>
          <p className="mt-2 text-gray-500 text-sm">DJSCE — Select your role to continue</p>
        </div>

        {/* Role cards */}
        <div className="grid w-full max-w-3xl gap-5 sm:grid-cols-3">
          {roles.map(({ role, label, desc, icon: RoleIcon }) => (
            <button
              key={role}
              onClick={() => handleRoleClick(role)}
              className="group flex flex-col items-center gap-4 rounded-2xl bg-white border border-gray-200 px-7 py-8 text-center shadow-sm hover:shadow-md hover:border-teal-400 transition-all duration-200"
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-200"
                style={{ background: "hsl(170,65%,40%)" }}
              >
                <RoleIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">{label}</h2>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
              <span
                className="mt-1 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-opacity"
                style={{ background: "hsl(170,65%,40%)" }}
              >
                <LogIn className="h-3 w-3" />
                Login as {label}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-10 text-xs text-gray-400">
          D.J. Sanghvi College of Engineering · Placement Cell
        </p>
      </main>

      {/* ── Login / Register Dialog ── */}
      <Dialog open={!!selectedRole} onOpenChange={() => setSelectedRole(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                style={{ background: "hsl(170,65%,40%)" }}
              >
                {selectedRole === "student" ? <GraduationCap className="h-4 w-4" /> :
                  selectedRole === "recruiter" ? <Briefcase className="h-4 w-4" /> :
                    <Shield className="h-4 w-4" />}
              </span>
              {isRegistering
                ? `Create ${selectedRole === "student" ? "Student" : "Recruiter"} Account`
                : `Login as ${selectedRole?.charAt(0).toUpperCase()}${selectedRole?.slice(1)}`}
            </DialogTitle>
          </DialogHeader>

          {isRegistering && (selectedRole === "student" || selectedRole === "recruiter") ? (
            <div className="space-y-4 py-2">
              {selectedRole === "student" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 mb-1 block">Full Name</Label>
                    <Input value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} placeholder="Full Name" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 mb-1 block">Email</Label>
                    <Input type="email" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} placeholder="example@gmail.com" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 mb-1 block">CGPA</Label>
                    <Input type="number" step="0.1" value={regForm.cgpa} onChange={(e) => setRegForm({ ...regForm, cgpa: e.target.value })} placeholder="8.5" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 mb-1 block">Password</Label>
                    <Input type="password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} placeholder="Create a password" />
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-400">You can add your SAP ID later from your profile after logging in.</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label className="text-xs font-semibold text-gray-600 mb-1 block">Company Name</Label>
                    <Input value={regForm.companyName} onChange={(e) => setRegForm({ ...regForm, companyName: e.target.value })} placeholder="Company Name" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 mb-1 block">Recruiter Name</Label>
                    <Input value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} placeholder="Recruiter Name" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 mb-1 block">Email</Label>
                    <Input type="email" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} placeholder="email@company.com" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs font-semibold text-gray-600 mb-1 block">Password</Label>
                    <Input type="password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} placeholder="Enter Password" />
                  </div>
                </div>
              )}
              <DialogFooter className="mt-4 flex sm:justify-between items-center">
                <Button variant="link" onClick={() => setIsRegistering(false)} className="px-0 text-teal-600">Back to Login</Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedRole(null)}>Cancel</Button>
                  <Button
                    onClick={submitRegistration}
                    style={{ background: "hsl(170,65%,40%)" }}
                    className="text-white hover:opacity-90"
                  >
                    Register & Login
                  </Button>
                </div>
              </DialogFooter>
            </div>
          ) : (
            <>
              <DialogDescription className="text-xs text-gray-500">
                {selectedRole === "student" && "Enter your SAP ID, Email, or Profile ID and Password to log in."}
                {selectedRole === "recruiter" && "Enter your Email and Password to log in."}
                {selectedRole === "coordinator" && "Enter your Coordinator SAP ID and Password to log in."}
              </DialogDescription>
              <div className="py-3 space-y-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    {selectedRole === "coordinator" ? "SAP ID" : selectedRole === "recruiter" ? "Email" : "Identifier"}
                  </Label>
                  <Input
                    autoFocus
                    placeholder={selectedRole === "student" ? "e.g. 500091234 or email" : selectedRole === "coordinator" ? "Enter your SAP ID" : "Enter your Email"}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && selectedRole !== "coordinator" && submitLogin()}
                    className="border-gray-200 focus:border-teal-400 focus:ring-teal-400"
                  />
                </div>
                {(selectedRole === "student" || selectedRole === "coordinator" || selectedRole === "recruiter") && (
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">Password</Label>
                    <Input
                      type="password"
                      placeholder={selectedRole === "coordinator" ? "Enter Access Password" : "Enter Password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitLogin()}
                      className="border-gray-200 focus:border-teal-400 focus:ring-teal-400"
                    />
                  </div>
                )}

                {(selectedRole === "student" || selectedRole === "recruiter") && (
                  <div className="text-center pt-1">
                    <span className="text-xs text-gray-400">Don't have an account? </span>
                    <Button variant="link" className="px-1 py-0 h-auto text-xs text-teal-600" onClick={() => setIsRegistering(true)}>
                      Register here
                    </Button>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedRole(null)}>Cancel</Button>
                <Button
                  onClick={submitLogin}
                  style={{ background: "hsl(170,65%,40%)" }}
                  className="text-white hover:opacity-90"
                >
                  Sign In
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
