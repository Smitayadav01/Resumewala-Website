import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useEmployer } from "../../context/EmployerContext";
import toast from "react-hot-toast";
import { useState } from "react";
import logo from "../../assets/logo.webp";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/employer/dashboard", icon: "🏠" },
  { label: "Post Job", to: "/employer/jobs/new", icon: "➕" },
  { label: "Manage Jobs", to: "/employer/jobs", icon: "📋" },
  { label: "Applicants", to: "/employer/applicants", icon: "👥" },
  { label: "Analytics", to: "/employer/analytics", icon: "📊" },   
  { label: "Company Profile", to: "/employer/profile", icon: "🏢" },
  { label: "Subscription", to: "/employer/plans", icon: "💳" },
];

export default function EmployerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { employer, logout } = useEmployer();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
    navigate("/employer/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
<div className="p-4 border-b border-gray-100">
  <Link to="/employer/dashboard" className="flex items-center gap-2">
    <img src={logo} alt="Resumewala" className="h-16 w-auto" />
    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
      Employer
    </span>
  </Link>
</div>

      {/* Employer Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {employer?.companyLogo ? (
            <img src={employer.companyLogo} className="w-9 h-9 rounded-lg object-cover border" alt="logo" />
          ) : (
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-sm">
              {employer?.companyName?.[0] || "E"}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1">
              {employer?.companyName}
              {employer?.isVerified && <span title="Verified" className="text-blue-500 text-xs">✓</span>}
            </p>
            <p className="text-xs text-gray-500 truncate">{employer?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.to ||
            (item.to === "/employer/jobs" && location.pathname.startsWith("/employer/jobs") && !location.pathname.includes("/new") && !location.pathname.includes("/edit"));
          return (
            <Link
              key={item.to} to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Subscription pill */}
      {employer?.subscription?.plan && employer.subscription.plan !== "none" && (
        <div className="mx-3 mb-2 bg-green-50 border border-green-200 rounded-xl p-3 text-xs">
          <p className="text-green-700 font-semibold capitalize">{employer.subscription.plan} Plan</p>
          <p className="text-green-600 mt-0.5">
            Credits: {employer.subscription.jobCredits === 99999 ? "∞" : employer.subscription.jobCredits}
          </p>
        </div>
      )}

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button onClick={handleLogout}
          className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 font-medium transition">
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-white border-r border-gray-100 shadow-sm flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="w-60 bg-white flex flex-col shadow-xl">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-gray-800 text-sm">{employer?.companyName}</span>
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-sm">
            {employer?.companyName?.[0] || "E"}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}