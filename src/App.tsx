import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { useAuth } from './context/AuthContext';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated } = useAuth();
  const authenticated = isAuthenticated();

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
     {location.pathname !== "/" && (
  <Navbar
    currentPage={location.pathname}
    isLoggedIn={authenticated}
    isAdmin={isAdmin}
  />
)}


      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route
            path="/home"
            element={
              authenticated ? <Home onNavigate={handleNavigate} /> : <Navigate to="/" replace />
            }
          />

          <Route path="/upload" element={<Upload />} />

          <Route
            path="/jobs"
            element={authenticated ? <Jobs /> : <Navigate to="/" replace />}
          />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route
            path="/profile"
            element={authenticated ? <Profile /> : <Navigate to="/" replace />}
          />

          <Route
            path="/admin"
            element={
              isAdmin ? (
                <>
                  <Navbar
                    currentPage="admin"
                    onNavigate={handleNavigate}
                    isLoggedIn={isLoggedIn}
                    isAdmin={isAdmin}
                    onLogout={handleLogout}
                  />
                  <Admin />
                </>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Legal Pages */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </div>

      {location.pathname !== '/' && <Footer />}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
