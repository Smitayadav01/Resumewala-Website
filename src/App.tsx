import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from "react-hot-toast";
import { lazy, Suspense } from "react";

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";


import { useAuth } from './context/AuthContext';

// ✅ Lazy Loaded Pages
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
// const Employee = lazy(() => import("./pages/Employee"));
const Dashboard = lazy(() => import('./pages/Dashboard'));


// const EmployerLogin = lazy(() => import('./pages/EmployerLogin'));
// const EmployerRegister = lazy(() => import('./pages/EmployerRegister'));
// const EmployerDashboard = lazy(() => import('./pages/EmployerDashboard'));
// const EmployerProfile = lazy(() => import('./pages/EmployerProfile'));
// const Applicants = lazy(() => import('./pages/Applicants'));
// const PostJob = lazy(() => import('./pages/PostJob'));
// const ManageJobs = lazy(() => import('./pages/ManageJobs'));



function AppContent() {

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const SHOW_EMPLOYEE_MODULE = false;

  const isEmployerRoute = location.pathname.startsWith("/employer");
  const isEmployeeRoute = location.pathname.startsWith("/employee");

  const authenticated = isAuthenticated();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const handleNavigate = (page: string) => {

    const routes: Record<string, string> = {
      home: '/',
      upload: '/upload',
      jobs: '/jobs',
      about: '/about',
      contact: '/contact',
      profile: '/profile',
      admin: '/admin',
      login: '/login',
      terms: '/terms',
      privacy: '/privacy',
      employee: '/employee',
    };

    navigate(routes[page] || '/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">

      <Toaster position="top-right" reverseOrder={false} />

      {/* Navbar */}
      {location.pathname !== "/login" && (
  <Navbar
    currentPage={location.pathname}
    isLoggedIn={authenticated}
    isAdmin={isAdmin()}
  />
)}
      <div className="flex-1">

        {/* ✅ Suspense added here */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-screen bg-white">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600 text-sm">Loading...</p>
              </div>
            </div>
          }
        >

          <Routes>

            {/* HOME */}
            <Route
              path="/"
              element={<Home onNavigate={handleNavigate} />}
            />

            {/* LOGIN */}
            <Route path="/login" element={<Landing />} />

            {/* MAIN ROUTES */}
            <Route path="/upload" element={<Upload />} />
            <Route path="/jobs" element={<Jobs />} />

            <Route
  path="/employer/*"
  element={
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Employee Portal
        </h1>

        <p className="text-gray-600 text-lg">
          Coming Soon 🚀
        </p>

        <p className="text-gray-500 mt-2">
          We're working on something exciting.
        </p>
      </div>
    </div>
  }
/>
           

            {/* PROTECTED */}
            <Route
              path="/profile"
              element={authenticated ? <Profile /> : <Navigate to="/login" replace />}
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                authenticated && isAdmin()
                  ? <Admin />
                  : <Navigate to="/login" replace />
              }
            />

            {/* PUBLIC */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />



            {/* <Route path="/employer/login" element={<EmployerLogin />} />
<Route path="/employer/register" element={<EmployerRegister />} />

<Route
  path="/employer/dashboard"
  element={
    
      <EmployerDashboard />
    
  }
/>

<Route
  path="/employer/profile"
  element={
    
      <EmployerProfile />
    
  }
/>

<Route
  path="/employer/post-job"
  element={
    
      <PostJob />
    
  }
/>

<Route
  path="/employer/manage-jobs"
  element={
    
      <ManageJobs />
    
  }
/>

<Route
  path="/employer/applicants"
  element={
    
      <Applicants />
    
  }
/> */}

          </Routes>

        </Suspense>
      </div>

      {/* Footer */}
{!isEmployeeRoute &&
 !isEmployerRoute &&
 location.pathname !== '/login' && (
  <Footer />
)}

      <ScrollToTop />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
