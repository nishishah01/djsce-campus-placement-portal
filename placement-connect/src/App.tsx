import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentJobs from "./pages/student/StudentJobs";
import StudentApplications from "./pages/student/StudentApplications";
import StudentProfile from "./pages/student/StudentProfile";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import RecruiterPostJob from "./pages/recruiter/RecruiterPostJob";
import RecruiterPostings from "./pages/recruiter/RecruiterPostings";
import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
import CoordinatorApplications from "./pages/coordinator/CoordinatorApplications";
import CoordinatorStudents from "./pages/coordinator/CoordinatorStudents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${role}`} replace />} />

      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/student/jobs" element={<StudentJobs />} />
      <Route path="/student/applications" element={<StudentApplications />} />
      <Route path="/student/profile" element={<StudentProfile />} />

      <Route path="/recruiter" element={<RecruiterDashboard />} />
      <Route path="/recruiter/post" element={<RecruiterPostJob />} />
      <Route path="/recruiter/postings" element={<RecruiterPostings />} />

      <Route path="/coordinator" element={<CoordinatorDashboard />} />
      <Route path="/coordinator/applications" element={<CoordinatorApplications />} />
      <Route path="/coordinator/students" element={<CoordinatorStudents />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
