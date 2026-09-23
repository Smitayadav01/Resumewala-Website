import axios from "axios";

// Always appends /api regardless of what VITE_API_URL contains
const BASE = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

const getToken = () => localStorage.getItem("employerToken");

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ─────────────────────────────────────────────────────
export const registerEmployer = (data: object) =>
  api.post("/employer/register", data).then((r) => r.data);

export const verifyEmployerEmail = (token: string) =>
  api.get(`/employer/verify-email/${token}`).then((r) => r.data);

export const loginEmployer = (data: object) =>
  api.post("/employer/login", data).then((r) => r.data);

export const forgotEmployerPassword = (email: string) =>
  api.post("/employer/forgot-password", { email }).then((r) => r.data);

export const resetEmployerPassword = (token: string, password: string) =>
  api.post(`/employer/reset-password/${token}`, { password }).then((r) => r.data);

export const getEmployerMe = () =>
  api.get("/employer/me").then((r) => r.data);

// ─── Dashboard ────────────────────────────────────────────────
export const getDashboardStats = () =>
  api.get("/employer/dashboard/stats").then((r) => r.data);

// ─── Profile ──────────────────────────────────────────────────
export const updateEmployerProfile = (data: object) =>
  api.put("/employer/profile", data).then((r) => r.data);

export const uploadEmployerLogo = (formData: FormData) =>
  api.post("/employer/profile/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

// ─── Jobs ─────────────────────────────────────────────────────
// Update getMyJobs
export const getMyJobs = () =>
  api.get("/employer/jobs").then((r) => {
    const data = r.data;
    // Backend now returns { jobs } object
    if (Array.isArray(data)) return { jobs: data };
    return data;
  });

// createJob — unchanged, just returns job
export const createJob = (payload: object) =>
  api.post("/employer/jobs", payload).then((r) => r.data);

// Add new function for credit info
export const getEmployerCreditInfo = () =>
  api.get("/employer/jobs").then((r) => r.data.creditInfo);


export const getJobById = (id: string) =>
  api.get(`/employer/jobs/${id}`).then((r) => r.data);

export const updateJob = (id: string, data: object) =>
  api.put(`/employer/jobs/${id}`, data).then((r) => r.data);

export const deleteJob = (id: string) =>
  api.delete(`/employer/jobs/${id}`).then((r) => r.data);

export const duplicateJob = (id: string) =>
  api.post(`/employer/jobs/${id}/duplicate`).then((r) => r.data);

// ─── Applicants ───────────────────────────────────────────────

export const getAllApplicants = (params?: object) =>
  api.get("/employer/applicants/all", { params }).then((r) => r.data);

export const getApplicants = (jobId: string, params?: object) =>
  api.get(`/employer/jobs/${jobId}/applicants`, { params }).then((r) => r.data);

export const updateApplicationStatus = (appId: string, status: string) =>
  api.patch(`/employer/applications/${appId}/status`, { status }).then((r) => r.data);

// ─── Payment ──────────────────────────────────────────────────
export const createPaymentOrder = (plan: string) =>
  api.post("/employer/payment/create-order", { plan }).then((r) => r.data);

export const verifyPayment = (data: object) =>
  api.post("/employer/payment/verify", data).then((r) => r.data);

export const getPaymentHistory = () =>
  api.get("/employer/payment/history").then((r) => r.data);

// ─── Public jobs (candidates browsing) ───────────────────────
export const getPublicJobs = (params?: object) =>
  api.get("/jobs", { params }).then((r) => r.data);

export const applyForJob = (jobId: string, data: object) =>
  api.post(`/jobs/${jobId}/apply`, data).then((r) => r.data);