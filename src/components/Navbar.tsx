import { Briefcase, User, LogOut, Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  currentPage: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
}

export default function Navbar({ currentPage, isLoggedIn, isAdmin }: NavbarProps) {

  const [mobileOpen, setMobileOpen] = useState(false);

  const { logout, isAuthenticated } = useAuth();
  const authenticated = isAuthenticated();

  const navigate = useNavigate();

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate('/');
  };

  const go = (page: string) => {

    setMobileOpen(false);

    const routes: Record<string, string> = {
      home: '/',
      jobs: '/jobs',
      profile: '/profile',
      admin: '/admin',
      about: '/about',
      contact: '/contact',
      login: '/login'
    };

    navigate(routes[page] || '/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 sm:py-0">

        {/* Top Bar */}
        <div className="flex justify-between items-center h-14 sm:h-16">

          {/* Logo */}
         <div
  className="flex items-center cursor-pointer"
  onClick={() => navigate('/')}
>
  {/* Logo */}
  <img
    src={logo}
    alt="Logo"
    className="h-12 sm:h-16 w-auto"
  />

  {/* Tagline */}
  <span className="text-[11px] sm:text-sm text-gray-500 font-medium whitespace-nowrap">
    India’s Smart Job Portal
  </span>
</div>
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">

            {/* Always visible */}
            {authenticated && <NavBtn label="Home" page="home" />}
            <NavBtn label="Browse Jobs" page="jobs" />

            {authenticated ? (
              <>
                {isAdmin ? (
                  <NavBtn label="Admin Panel" page="admin" />
                ) : (
                  <button
                    onClick={() => go('profile')}
                    className={`flex items-center space-x-2 nav-btn ${
                      currentPage === 'profile' ? 'text-blue-500' : ''
                    }`}
                  >
                    <User className="h-5 w-5" />
                    <span>My Profile</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 nav-btn hover:text-red-500"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavBtn label="About Us" page="about" />
                <NavBtn label="Contact" page="contact" />

                <button
                  onClick={() => go('login')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Login / Sign Up
                </button>
              </>
            )}

          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (

        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">

          <div className="flex flex-col p-4 space-y-3">

            {/* Always visible */}
            <MobileBtn label="Home" page="home" />
            <MobileBtn label="Browse Jobs" page="jobs" />

            {authenticated ? (
              <>
                {isAdmin ? (
                  <MobileBtn label="Admin Panel" page="admin" />
                ) : (
                  <MobileBtn
                    label="My Profile"
                    page="profile"
                    icon={<User className="h-4 w-4" />}
                  />
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-500 font-medium py-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <MobileBtn label="About Us" page="about" />
                <MobileBtn label="Contact" page="contact" />

                <button
                  onClick={() => go('login')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Login / Sign Up
                </button>
              </>
            )}

          </div>
        </div>

      )}
    </nav>
  );

  /* Desktop Button */

  function NavBtn({ label, page }: { label: string; page: string }) {
    return (
      <button
        onClick={() => go(page)}
        className={`nav-btn font-medium ${
          currentPage === page ? 'text-blue-500' : 'text-gray-700'
        }`}
      >
        {label}
      </button>
    );
  }

  /* Mobile Button */

  function MobileBtn({
    label,
    page,
    icon,
  }: {
    label: string;
    page: string;
    icon?: React.ReactNode;
  }) {
    return (
      <button
        onClick={() => go(page)}
        className="flex items-center gap-2 text-gray-700 font-medium py-2"
      >
        {icon}
        {label}
      </button>
    );
  }
}