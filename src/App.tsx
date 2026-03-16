import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from "react-hot-toast";

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Jobs from './pages/Jobs';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { useAuth } from './context/AuthContext';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Employee from "./pages/Employee";
import ScrollToTop from './components/ScrollToTop';


function AppContent() {

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  const authenticated = isAuthenticated();

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
      employee:'/employee',
    };

    navigate(routes[page] || '/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">

      <Toaster position="top-right" reverseOrder={false} />

      {/* Hide navbar only on login page */}
      {location.pathname !== "/login" && (
        <Navbar
          currentPage={location.pathname}
          isLoggedIn={authenticated}
          isAdmin={isAdmin()}
        />
      )}

      <div className="flex-1">

        <Routes>

          {/* HOME PAGE FIRST */}
          <Route
            path="/"
            element={<Home onNavigate={handleNavigate} />}
          />

          {/* LOGIN / SIGNUP PAGE */}
          <Route path="/login" element={<Landing />} />

          {/* PROTECTED ROUTES */}

          <Route
            path="/upload"
            element={authenticated ? <Upload /> : <Navigate to="/login" replace />}
          />

         <Route path="/jobs" element={<Jobs />} />

           <Route path="/employee" element={<Employee />} />

          <Route
            path="/profile"
            element={authenticated ? <Profile /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/admin"
            element={
              authenticated && isAdmin()
                ? <Admin />
                : <Navigate to="/login" replace />
            }
          />

          {/* PUBLIC PAGES */}

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

        </Routes>

      </div>

      {location.pathname !== '/login' && <Footer />}

      <ScrollToTop />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}