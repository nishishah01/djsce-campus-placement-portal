import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
  description?: string;
  jdUrl?: string;
  jdPdf?: string;
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

const API_URL = 'http://127.0.0.1:8000/api/';

const fetcher = async (url: string) => {
  const res = await fetch(API_URL + url);
  if (!res.ok) throw new Error('API Error');
  return res.json();
};

export const useStudents = () => useQuery<Student[]>({ queryKey: ['students'], queryFn: () => fetcher('students/') });
export const useJobs = () => useQuery<Job[]>({ queryKey: ['jobs'], queryFn: () => fetcher('jobs/') });
export const useApplications = () => useQuery<Application[]>({ queryKey: ['applications'], queryFn: () => fetcher('applications/') });
export const useRecruiters = () => useQuery<any[]>({ queryKey: ['recruiters'], queryFn: () => fetcher('recruiters/') });

export const useCreateApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const isFormData = data instanceof FormData;
      const res = await fetch(API_URL + 'applications/', {
        method: 'POST',
        headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
        body: isFormData ? data : JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const isFormData = data instanceof FormData;
      const res = await fetch(API_URL + 'jobs/', {
        method: 'POST',
        headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
        body: isFormData ? data : JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create job');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(API_URL + 'students/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create student');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useCreateRecruiter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(API_URL + 'recruiters/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create recruiter');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiters'] });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData | Partial<Student> }) => {
      const isFormData = data instanceof FormData;
      const res = await fetch(API_URL + `students/${id}/`, {
        method: 'PUT',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? data : JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update student');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};
