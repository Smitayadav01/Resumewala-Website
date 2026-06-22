import { authFetch } from "./apiClient";

const get = (url: string) =>
  authFetch(url, {
    method: "GET",
  });

const post = (url: string, data?: any) =>
  authFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });

const put = (url: string, data?: any) =>
  authFetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });

const del = (url: string) =>
  authFetch(url, {
    method: "DELETE",
  });

// ─── AUTH ──────────────────────────────────────
export const employerRegister = (data: object) =>
  post("/employer/register", data);

export const employerLogin = (data: {
  email: string;
  password: string;
}) => post("/employer/login", data);

export const employerForgotPassword = (email: string) =>
  post("/employer/forgot-password", { email });

export const employerResetPassword = (
  token: string,
  password: string
) => post(`/employer/reset-password/${token}`, { password });

export const verifyEmployerEmail = (token: string) =>
  get(`/employer/verify-email/${token}`);

// ─── PROFILE & DASHBOARD ───────────────────────
export const getEmployerProfile = () =>
  get("/employer/profile");

export const getEmployerDashboard = () =>
  get("/employer/dashboard");

// ─── JOBS ──────────────────────────────────────
export const createJob = (data: object) =>
  post("/employer/jobs", data);

export const getMyJobs = () =>
  get("/employer/jobs");

export const getJobById = (id: string) =>
  get(`/employer/jobs/${id}`);

export const updateJob = (id: string, data: object) =>
  put(`/employer/jobs/${id}`, data);

export const deleteJob = (id: string) =>
  del(`/employer/jobs/${id}`);

export const duplicateJob = (id: string) =>
  post(`/employer/jobs/${id}/duplicate`);

// ─── PUBLIC JOBS ───────────────────────────────
export const getPublicJobs = () =>
  get("/employer/jobs/public");

export const getPublicJobById = (id: string) =>
  get(`/employer/jobs/public/${id}`);

// ─── APPLICATIONS ──────────────────────────────
export const getJobApplicants = (jobId: string) =>
  get(`/employer/jobs/${jobId}/applicants`);

export const updateApplicationStatus = (
  appId: string,
  status: string,
  notes?: string
) =>
  put(`/employer/applications/${appId}/status`, {
    status,
    notes,
  });

export const getAllApplications = () =>
  get("/employer/applications");

export const applyToJob = (jobId: string) =>
  post(`/employer/jobs/${jobId}/apply`);

export const getCandidateApplications = () =>
  get("/employer/my-applications");

// ─── PAYMENTS ──────────────────────────────────
export const createPaymentOrder = (plan: string) =>
  post("/employer/payment/create-order", { plan });

export const verifyPayment = (data: object) =>
  post("/employer/payment/verify", data);

export const getPaymentHistory = () =>
  get("/employer/payment/history");


export const updateEmployerProfile = (data: FormData) =>
  authFetch("/employer/profile", {
    method: "PUT",
    body: data,
  });

  