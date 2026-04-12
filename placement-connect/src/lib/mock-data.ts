export type Role = "student" | "recruiter" | "coordinator";

export interface Student {
  id: string;
  name: string;
  sapId: string;
  email: string;
  department: string;
  dob: string;
  score10th: number;
  score12th: number;
  cgpa: number;
  resumeUrl: string;
  avatar?: string;
}

export interface Job {
  id: string;
  companyName: string;
  role: string;
  stipend: string;
  eligibleDepartments: string[];
  deadline: string;
  description: string;
  postedBy: string;
  postedAt: string;
  location: string;
  type: "Full-Time" | "Internship" | "Part-Time";
}

export interface Application {
  id: string;
  studentId: string;
  jobId: string;
  appliedAt: string;
  status: "pending" | "shortlisted" | "rejected" | "accepted";
  customResume?: string;
  coverNote?: string;
}

// export const mockStudents: Student[] = [
//   { id: "s1", name: "Aarav Sharma", sapId: "500091234", email: "aarav@university.edu", department: "Computer Science", dob: "2002-03-15", score10th: 92, score12th: 88, cgpa: 8.7, resumeUrl: "/resume.pdf" },
//   { id: "s2", name: "Priya Patel", sapId: "500091235", email: "priya@university.edu", department: "Information Technology", dob: "2002-07-22", score10th: 95, score12th: 91, cgpa: 9.2, resumeUrl: "/resume.pdf" },
//   { id: "s3", name: "Rohan Mehta", sapId: "500091236", email: "rohan@university.edu", department: "Electronics", dob: "2001-11-08", score10th: 87, score12th: 82, cgpa: 7.8, resumeUrl: "/resume.pdf" },
//   { id: "s4", name: "Sneha Gupta", sapId: "500091237", email: "sneha@university.edu", department: "Computer Science", dob: "2002-01-30", score10th: 90, score12th: 85, cgpa: 8.4, resumeUrl: "/resume.pdf" },
//   { id: "s5", name: "Vikram Singh", sapId: "500091238", email: "vikram@university.edu", department: "Mechanical", dob: "2001-09-12", score10th: 85, score12th: 80, cgpa: 7.5, resumeUrl: "/resume.pdf" },
// ];

// export const mockJobs: Job[] = [
//   { id: "j1", companyName: "Google", role: "Software Engineer Intern", stipend: "₹80,000/month", eligibleDepartments: ["Computer Science", "Information Technology"], deadline: "2026-05-15", description: "Join Google's engineering team for a 6-month internship working on large-scale distributed systems. You'll collaborate with world-class engineers on projects that impact billions of users.", postedBy: "r1", postedAt: "2026-04-01", location: "Bangalore", type: "Internship" },
//   { id: "j2", companyName: "Microsoft", role: "Full Stack Developer", stipend: "₹12,00,000/year", eligibleDepartments: ["Computer Science", "Information Technology", "Electronics"], deadline: "2026-05-20", description: "Build and maintain web applications using React and .NET. Work on Azure cloud services and contribute to products used by millions worldwide.", postedBy: "r2", postedAt: "2026-04-03", location: "Hyderabad", type: "Full-Time" },
//   { id: "j3", companyName: "Tata Consultancy Services", role: "Associate Engineer", stipend: "₹7,00,000/year", eligibleDepartments: ["Computer Science", "Information Technology", "Electronics", "Mechanical"], deadline: "2026-06-01", description: "Join TCS as an associate engineer and work on enterprise software solutions for global clients across various domains.", postedBy: "r3", postedAt: "2026-04-05", location: "Mumbai", type: "Full-Time" },
//   { id: "j4", companyName: "Amazon", role: "Data Analyst Intern", stipend: "₹60,000/month", eligibleDepartments: ["Computer Science", "Information Technology"], deadline: "2026-05-25", description: "Analyze large datasets to derive insights that drive business decisions. Work with SQL, Python, and AWS tools.", postedBy: "r1", postedAt: "2026-04-07", location: "Chennai", type: "Internship" },
// ];

// export const mockApplications: Application[] = [
//   { id: "a1", studentId: "s1", jobId: "j1", appliedAt: "2026-04-05", status: "shortlisted", coverNote: "Passionate about distributed systems." },
//   { id: "a2", studentId: "s2", jobId: "j1", appliedAt: "2026-04-06", status: "pending" },
//   { id: "a3", studentId: "s1", jobId: "j2", appliedAt: "2026-04-07", status: "pending", coverNote: "Experienced in React and Node.js." },
//   { id: "a4", studentId: "s3", jobId: "j3", appliedAt: "2026-04-08", status: "accepted" },
//   { id: "a5", studentId: "s4", jobId: "j1", appliedAt: "2026-04-09", status: "rejected" },
//   { id: "a6", studentId: "s2", jobId: "j2", appliedAt: "2026-04-10", status: "shortlisted" },
//   { id: "a7", studentId: "s5", jobId: "j3", appliedAt: "2026-04-10", status: "pending" },
//   { id: "a8", studentId: "s4", jobId: "j4", appliedAt: "2026-04-11", status: "pending" },
// ];
