import { Routes, Route, Navigate, useNavigate,useLocation } from 'react-router-dom';
import { useState } from 'react';

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
import Login from './pages/Login';
import Register from './pages/Register';

// ✅ NEW IMPORTS
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


  const handleLogin = (adminStatus: boolean) => {
    setIsLoggedIn(true);
    setIsAdmin(adminStatus);
    navigate(adminStatus ? '/admin' : '/home');
  };

  const handleNavigate = (page: string) => {
    const routes: Record<string, string> = {
      landing: '/',
      home: '/home',
      upload: '/upload',
      jobs: '/jobs',
      about: '/about',
      contact: '/contact',
      profile: '/profile',
      admin: '/admin',
      login: '/login',
      register: '/register',
      terms: '/terms',
      privacy: '/privacy',
    };
    navigate(routes[page] || '/');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate('/');
  };

  return (
  <div className="min-h-screen flex flex-col bg-white">
    
    {/* MAIN CONTENT */}
    <div className="flex-1">
      <Routes>
        <Route path="/" element={<Landing onLogin={handleLogin} onNavigate={handleNavigate} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onNavigate={handleNavigate} />} />

        <Route
          path="/home"
          element={
            isLoggedIn ? (
              <>
                <Navbar currentPage="home" onNavigate={handleNavigate} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />
                <Home onNavigate={handleNavigate} />
              </>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/upload"
          element={
            isLoggedIn ? (
              <>
                <Navbar currentPage="upload" onNavigate={handleNavigate} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />
                <Upload />
              </>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/jobs"
          element={
            isLoggedIn ? (
              <>
                <Navbar currentPage="jobs" onNavigate={handleNavigate} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />
                <Jobs onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />
              </>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/profile"
          element={
            isLoggedIn ? (
              <>
                <Navbar currentPage="profile" onNavigate={handleNavigate} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />
                <Profile onNavigate={handleNavigate} />
              </>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/about"
          element={
            <>
              <Navbar currentPage="about" onNavigate={handleNavigate} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />
              <About />
            </>
          }
        />

        <Route
          path="/contact"
          element={
            <>
              <Navbar currentPage="contact" onNavigate={handleNavigate} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />
              <Contact />
            </>
          }
        />

        <Route
          path="/admin"
          element={
            isAdmin ? (
              <>
                <Navbar currentPage="admin" onNavigate={handleNavigate} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />
                <Admin />
              </>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        {/* ✅ LEGAL PAGES (NO LOGIN REQUIRED) */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </div>

    {/* FOOTER */}
   {location.pathname !== '/' && <Footer />}


  </div>
);

}

export default function App() {
  return (
   
      <AppContent />
    
  );
}
