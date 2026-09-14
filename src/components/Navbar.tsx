import {
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import logo from "../assets/logo.webp";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  currentPage: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
}

function Navbar({
  currentPage,
  isLoggedIn,
  isAdmin,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { logout, isAuthenticated } = useAuth();
  const authenticated = isAuthenticated();

  const navigate = useNavigate();

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate("/");
  };

  const go = (page: string) => {
    setMobileOpen(false);

    const routes: Record<string, string> = {
      home: "/",
      jobs: "/jobs",
      profile: "/profile",
      admin: "/admin",
      about: "/about",
      contact: "/contact",
      login: "/login",
      employer: "/employer/login",
      resumeServices: "/resume-services",
    };

    navigate(routes[page] || "/");
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      {/* ================= TOP BAR ================= */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center min-h-14 sm:h-16">

          {/* ================= LOGO ================= */}
          <div
            className="flex items-center cursor-pointer min-w-0"
            onClick={() => navigate("/")}
          >
            <img
              src={logo}
              alt="Resumewala"
              className="h-11 sm:h-14 md:h-16 w-auto shrink-0"
            />

            <span className="hidden sm:block ml-2 text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap">
              India's Smart Job Portal
            </span>
          </div>

          {/* ================= DESKTOP NAV ================= */}
          <div className="hidden md:flex items-center gap-5 lg:gap-6">

            {authenticated && (
              <NavBtn
                label="Home"
                page="home"
              />
            )}

            <NavBtn
              label="Post a Job for Free"
              page="employer"
              // highlighted={true}
            />

            <NavBtn
              label="Browse Jobs"
              page="jobs"
            />

            <NavBtn
              label="Resume Writing"
              page="resumeServices"
              // highlighted={true}
            />

            {authenticated ? (
              <>
                {isAdmin ? (
                  <NavBtn
                    label="Admin Panel"
                    page="admin"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => go("profile")}
                    className="flex items-center gap-2 font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span>My Profile</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 font-medium text-gray-700 hover:text-red-500 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavBtn
                  label="About Us"
                  page="about"
                />

                <NavBtn
                  label="Contact"
                  page="contact"
                />

                <button
                  type="button"
                  onClick={() => go("login")}
                  className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Login / Sign Up
                </button>
              </>
            )}
          </div>

          {/* ================= MOBILE MENU BUTTON ================= */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* ================= MOBILE NAV ================= */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-1">

            <MobileBtn
              label="Home"
              page="home"
            />

            <MobileBtn
              label="Post a Job for Free"
              page="employer"
              // highlighted={true}
            />

            <MobileBtn
              label="Browse Jobs"
              page="jobs"
            />

            <MobileBtn
              label="Resume Writing"
              page="resumeServices"
              // highlighted={true}
            />

            <div className="border-t border-gray-100 my-3" />

            {authenticated ? (
              <>
                {isAdmin ? (
                  <MobileBtn
                    label="Admin Panel"
                    page="admin"
                  />
                ) : (
                  <MobileBtn
                    label="My Profile"
                    page="profile"
                    icon={<User className="h-5 w-5" />}
                  />
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-500 font-medium hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <MobileBtn
                  label="About Us"
                  page="about"
                />

                <MobileBtn
                  label="Contact"
                  page="contact"
                />

                <button
                  type="button"
                  onClick={() => go("login")}
                  className="w-full mt-3 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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

  /* ================= DESKTOP BUTTON ================= */

  function NavBtn({
    label,
    page,
    highlighted = false,
  }: {
    label: string;
    page: string;
    highlighted?: boolean;
  }) {
    let buttonClass = "font-medium whitespace-nowrap transition-colors ";

    if (currentPage === page) {
      buttonClass += "text-blue-600";
    } else if (highlighted) {
      buttonClass += "text-blue-600 hover:text-blue-700";
    } else {
      buttonClass += "text-gray-700 hover:text-blue-600";
    }

    return (
      <button
        type="button"
        onClick={() => go(page)}
        className={buttonClass}
      >
        {label}
      </button>
    );
  }

  /* ================= MOBILE BUTTON ================= */

  function MobileBtn({
    label,
    page,
    icon,
    highlighted = false,
  }: {
    label: string;
    page: string;
    icon?: React.ReactNode;
    highlighted?: boolean;
  }) {
    let buttonClass =
      "w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-left transition-colors ";

    if (currentPage === page) {
      buttonClass += "bg-blue-50 text-blue-600";
    } else if (highlighted) {
      buttonClass += "text-blue-600 hover:bg-blue-50";
    } else {
      buttonClass += "text-gray-700 hover:bg-gray-50";
    }

    return (
      <button
        type="button"
        onClick={() => go(page)}
        className={buttonClass}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  }
}
export default Navbar;





// import { User, LogOut, Menu, X,BriefcaseBusiness, FileText } from 'lucide-react';
// import logo from "../assets/logo.webp";
// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate, useLocation } from 'react-router-dom';

// interface NavbarProps {
//   currentPage: string;
//   isLoggedIn: boolean;
//   isAdmin: boolean;
// }

// export default function Navbar({ currentPage, isLoggedIn, isAdmin }: NavbarProps) {

//   const [mobileOpen, setMobileOpen] = useState(false);
//   const { logout, isAuthenticated } = useAuth();
//   const authenticated = isAuthenticated();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleLogout = () => {
//     setMobileOpen(false);
//     logout();
//     navigate('/');
//   };

//   const go = (page: string) => {
//     setMobileOpen(false);
//     const routes: Record<string, string> = {
//       home: '/',
//       jobs: '/jobs',
//       profile: '/profile',
//       admin: '/admin',
//       about: '/about',
//       contact: '/contact',
//       login: '/login',
//       employer: '/employer/login',
//       resumeServices: '/resume-services',
//     };
//     navigate(routes[page] || '/');
//   };

//   return (
//     <nav className="bg-white shadow-sm sticky top-0 z-50">

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 sm:py-0">

//         {/* Top Bar */}
//         <div className="flex justify-between items-center h-14 sm:h-16">

//           {/* Logo */}
//           <div
//             className="flex items-center cursor-pointer"
//             onClick={() => navigate('/')}
//           >
//             <img src={logo} alt="Logo" className="h-12 sm:h-16 w-auto" />
//             <span className="text-[11px] sm:text-sm text-gray-500 font-medium whitespace-nowrap">
//               India's Smart Job Portal
//             </span>
//           </div>

//           {/* Desktop Menu */}
//           <div className="hidden md:flex items-center space-x-6">
//             {authenticated && <NavBtn label="Home" page="home" />}
//              <NavBtn label="Post a Job for Free" page="employer" />
//              <NavBtn label="Browse Jobs" page="jobs" />
           

//             {authenticated ? (
//               <>
//                 {isAdmin ? (
//                   <NavBtn label="Admin Panel" page="admin" />
//                 ) : (
//                   <button
//                     onClick={() => go('profile')}
//                     className={`flex items-center space-x-2 nav-btn ${
//                       currentPage === 'profile' ? 'text-blue-500' : ''
//                     }`}
//                   >
//                     <User className="h-5 w-5" />
//                     <span>My Profile</span>
//                   </button>
//                 )}

//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center space-x-2 nav-btn hover:text-red-500"
//                 >
//                   <LogOut className="h-5 w-5" />
//                   <span>Logout</span>
//                 </button>
//               </>
//             ) : (
//               <>
//                 <NavBtn label="About Us" page="about" />
//                 <NavBtn label="Contact" page="contact" />
//                 <NavBtn label="Resume Writing" page="resumeServices" />

//                 <button
//                   onClick={() => go('login')}
//                   className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//                 >
//                   Login / Sign Up
//                 </button>
//               </>
//             )}
//           </div>

//           {/* Mobile Menu Button */}
//           <button
//             className="md:hidden text-gray-700"
//             onClick={() => setMobileOpen(!mobileOpen)}
//           >
//             {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//           </button>

//         </div>
//       </div>

//       {/* Mobile Menu */}
//       {mobileOpen && (
//         <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
//           <div className="flex flex-col p-4 space-y-3">

//             <MobileBtn label="Home" page="home" />
//             <MobileBtn label="Post a Job for Free" page="employer" icon={<BriefcaseBusiness className="h-5 w-5" />} highlighted />
//             <MobileBtn label="Browse Jobs" page="jobs" />
//             <MobileBtn label="Resume Writing" page="resumeServices" />

//             {authenticated ? (
//               <>
//                 {isAdmin ? (
//                   <MobileBtn label="Admin Panel" page="admin" />
//                 ) : (
//                   <MobileBtn
//                     label="My Profile"
//                     page="profile"
//                     icon={<User className="h-4 w-4" />}
//                   />
//                 )}

//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center gap-2 text-red-500 font-medium py-2"
//                 >
//                   <LogOut className="h-4 w-4" />
//                   Logout
//                 </button>
//               </>
//             ) : (
//               <>
//                 <MobileBtn label="About Us" page="about" />
//                 <MobileBtn label="Contact" page="contact" />

//                 <button
//                   onClick={() => go('login')}
//                   className="bg-blue-600 text-white px-4 py-2 rounded-lg"
//                 >
//                   Login / Sign Up
//                 </button>
//               </>
//             )}

//           </div>
//         </div>
//       )}
//     </nav>
//   );

//   /* Desktop Button */
//   function NavBtn({ label, page }: { label: string; page: string }) {
//     return (
//       <button
//         onClick={() => go(page)}
//         className={`nav-btn font-medium ${
//           currentPage === page ? 'text-blue-500' : 'text-gray-700'
//         }`}
//       >
//         {label}
//       </button>
//     );
//   }

//   /* Mobile Button */
//   function MobileBtn({
//     label,
//     page,
//     icon,
//   }: {
//     label: string;
//     page: string;
//     icon?: React.ReactNode;
//   }) {
//     return (
//       <button
//         onClick={() => go(page)}
//         className="flex items-center gap-2 text-gray-700 font-medium py-2"
//       >
//         {icon}
//         {label}
//       </button>
//     );
//   }
// }