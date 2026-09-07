import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from "react-hot-toast";
import { lazy, Suspense } from "react";
import { trackPageView } from "./utils/metaPixel";
import { useEffect } from "react";

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedEmployerRoute from "./components/employer/ProtectedEmployerRoute";


import { useAuth } from './context/AuthContext';

// ─── Candidate Pages (existing) ───────────────────────────────
const Home = lazy(() => import('./pages/Home'));
const Landing = lazy(() => import('./pages/Landing'));
const Upload = lazy(() => import('./pages/Upload'));
const Jobs = lazy(() => import('./pages/Jobs'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Employee = lazy(() => import("./pages/employer/Employee"));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// ─── Employer Pages (Phase 2) ─────────────────────────────────
const EmployerLayout = lazy(() => import('./components/employer/EmployerLayout'));
const EmployerLogin = lazy(() => import('./pages/employer/EmployerLogin'));
const EmployerRegister = lazy(() => import('./pages/employer/EmployerRegister'));
const EmployerDashboard = lazy(() => import('./pages/employer/EmployerDashboard'));
const PostJob = lazy(() => import('./pages/employer/PostJob'));
const ManageJobs = lazy(() => import('./pages/employer/ManageJobs'));
const ApplicantPanel = lazy(() => import('./pages/employer/ApplicantPanel'));
const EmployerProfile = lazy(() => import('./pages/employer/EmployerProfile'));
const SubscriptionPlans = lazy(() => import('./pages/employer/SubscriptionPlans'));
const EmployerVerifyEmail = lazy(() => import('./pages/employer/EmployerVerifyEmail'));
const EmployerAnalytics = lazy(() => import('./pages/employer/EmployerAnalytics'));
const ResumeServices = lazy(() => import('./pages/ResumeServices'));
const ResumeServicesThankYou = lazy(() => import('./pages/ResumeServicesThankYou'));

const Spinner = () => (
  <div className="flex items-center justify-center h-screen bg-white">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-gray-600 text-sm">Loading...</p>
    </div>
  </div>
);

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

// ✅ Fire PageView on every page navigation
  useEffect(() => {
    trackPageView();
  }, [location.pathname]);

  const { isAuthenticated, isAdmin, loading } = useAuth();

  const isEmployeeRoute = location.pathname.startsWith("/employee");
  const isEmployerRoute = location.pathname.startsWith("/employer");
  const authenticated = isAuthenticated();

  if (loading) return <Spinner />;

  const handleNavigate = (page: string) => {
    const routes: Record<string, string> = {
      home: '/', upload: '/upload', jobs: '/jobs', about: '/about',
      contact: '/contact', profile: '/profile', admin: '/admin',
      login: '/login', terms: '/terms', privacy: '/privacy', employee: '/employee',
    };
    navigate(routes[page] || '/');
  };

  const hideNavFooter = isEmployeeRoute || isEmployerRoute || location.pathname === "/login";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Toaster position="top-right" reverseOrder={false} />

      {!hideNavFooter && (
        <Navbar currentPage={location.pathname} isLoggedIn={authenticated} isAdmin={isAdmin()} />
      )}

      <div className="flex-1">
        <Suspense fallback={<Spinner />}>
          <Routes>
            {/* ─── Candidate Routes (existing) ─── */}
            <Route path="/" element={<Home onNavigate={handleNavigate} />} />
            <Route path="/login" element={<Landing />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/employee/*" element={<Employee />} />
            <Route path="/profile" element={authenticated ? <Profile /> : <Navigate to="/login" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={authenticated && isAdmin() ? <Admin /> : <Navigate to="/login" replace />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/resume-services" element={<ResumeServices />} />
            <Route path="/resume-services/thank-you" element={<ResumeServicesThankYou />} />

            {/* ─── Employer Auth Routes (public) ─── */}
            <Route path="/employer/login" element={<EmployerLogin />} />
            <Route path="/employer/register" element={<EmployerRegister />} />
            <Route path="/employer/verify-email/:token" element={<EmployerVerifyEmail />} />
            <Route path="/employer/forgot-password" element={<ForgotPassword employerMode />} />
            <Route path="/employer/reset-password/:token" element={<ResetPassword employerMode />} />

            {/* ─── Employer Protected Routes ─── */}
            <Route
              path="/employer"
              element={
                <ProtectedEmployerRoute>
                  <EmployerLayout />
                </ProtectedEmployerRoute>
              }
            >
              <Route index element={<Navigate to="/employer/dashboard" replace />} />
              <Route path="dashboard" element={<EmployerDashboard />} />
              <Route path="jobs" element={<ManageJobs />} />
              <Route path="jobs/new" element={<PostJob />} />
              <Route path="jobs/edit/:id" element={<PostJob />} />
              <Route path="applicants" element={<ApplicantPanel />} />
              <Route path="applicants/:jobId" element={<ApplicantPanel />} />
              <Route path="profile" element={<EmployerProfile />} />
              <Route path="plans" element={<SubscriptionPlans />} />
              <Route path="analytics" element={<EmployerAnalytics />} />
            </Route>
          </Routes>
        </Suspense>
      </div>

      {!hideNavFooter && <Footer />}
      <ScrollToTop />
    </div>
  );
}

export default function App() {
  return (
    
      <AppContent />
    
  );
}