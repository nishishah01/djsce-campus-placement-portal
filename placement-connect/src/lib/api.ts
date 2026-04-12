import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';

export const api = axios.create({
  baseURL: API_URL,
});

export const getStudents = () => api.get('students/').then(res => res.data);
export const getJobs = () => api.get('jobs/').then(res => res.data);
export const getApplications = () => api.get('applications/').then(res => res.data);

export const createStudent = (data: any) => api.post('students/', data).then(res => res.data);
export const createJob = (data: any) => api.post('jobs/', data).then(res => res.data);
export const createApplication = (data: any) => api.post('applications/', data).then(res => res.data);
