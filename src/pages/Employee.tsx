import { Routes, Route } from "react-router-dom";

import Layout from "../components/EmployeeLayout";
import ProtectedRoute from "../components/ProtectedRoute";

// Auth Pages
import EmployerLogin from "./EmployerLogin";
import EmployerRegister from "./EmployerRegister";
// import EmployerForgotPassword from "./EmployerForgotPassword";
// import EmployerResetPassword from "./EmployerResetPassword";
// import VerifyEmployerEmail from "./VerifyEmployerEmail";

// Dashboard Pages
import Dashboard from "./Dashboard";
import Jobs from "./Jobs";
// import JobForm from "./JobForm";
// import JobDetails from "./JobDetails";
import Candidates from "./Candidates";
import Analytics from "./Analytics";
import Settings from "./Settings";
import EmployerProfile from "./EmployerProfile";
// import PaymentHistory from "./PaymentHistory";

function Employee() {
  return (
    <Routes>
      {/* ─── AUTH ROUTES ───────────────────────── */}
      <Route path="login" element={<EmployerLogin />} />
      <Route path="register" element={<EmployerRegister />} />
      {/* <Route
        path="forgot-password"
        element={<EmployerForgotPassword />}
      />
      <Route
        path="reset-password/:token"
        element={<EmployerResetPassword />}
      />
      <Route
        path="verify-email/:token"
        element={<VerifyEmployerEmail />}
      /> */}

      {/* ─── PROTECTED EMPLOYER DASHBOARD ─────── */}
      <Route
        path="/*"
        element={
          // <ProtectedRoute>
            <Layout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />

                {/* Profile */}
                <Route path="profile" element={<EmployerProfile />} />

                {/* Jobs */}
                <Route path="jobs" element={<Jobs />} />
                {/* <Route path="jobs/create" element={<JobForm />} />
                <Route path="jobs/:id" element={<JobDetails />} />
                <Route path="jobs/:id/edit" element={<JobForm />} /> */}

                {/* Candidates / Applications */}
                <Route path="candidates" element={<Candidates />} />

                {/* Analytics */}
                <Route path="analytics" element={<Analytics />} />

                {/* Payments */}
                {/* <Route
                  path="payment-history"
                  element={<PaymentHistory />}
                /> */}

                {/* Settings */}
                <Route path="settings" element={<Settings />} />
              </Routes>
            </Layout>
          // </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default Employee;











// import { Routes, Route } from "react-router-dom";
// import Layout from '../components/EmployeeLayout';

// import Dashboard from "./Dashboard";
// import Jobs from "./Jobs";
// import Candidates from "./Candidates";
// import Analytics from "./Analytics";
// import Settings from "./Settings";

// function Employee() {
//   return (
//     <Layout>
//       <Routes>
//         <Route index element={<Dashboard />} />
//         <Route path="jobs" element={<Jobs />} />
//         <Route path="candidates" element={<Candidates />} />
//         <Route path="analytics" element={<Analytics />} />
//         <Route path="settings" element={<Settings />} />
//       </Routes>
//     </Layout>
//   );
// }

// export default Employee;



// // import { Briefcase, LogOut, Zap } from "lucide-react";
// // import { useNavigate } from "react-router-dom";
// // import { useAuth } from "../context/AuthContext";

// // export default function EmployeeComingSoon() {
// //   const navigate = useNavigate();
// //   const { logout, isAuthenticated } = useAuth();

// //   const handleLogout = () => {
// //     logout();
// //   };

// //   return (
// //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      
// //       <div className="text-center max-w-lg p-10 bg-white rounded-3xl shadow-xl border border-gray-100">

// //         {/* Icon */}
// //         <div className="flex justify-center mb-6">
// //           <div className="p-4 bg-blue-100 rounded-full">
// //             <Briefcase className="h-10 w-10 text-blue-600" />
// //           </div>
// //         </div>

// //         {/* Heading */}
// //         <h1 className="text-4xl font-bold text-gray-900 mb-4">
// //           Employee Dashboard
// //         </h1>

// //         {/* Message */}
// //         <p className="text-gray-600 text-lg mb-6">
// //           🚀 We’re building something amazing for employers. <br />
// //           This feature will be live very soon!
// //         </p>

// //         {/* Extra line */}
// //         <p className="text-sm text-gray-400 mb-8">
// //           Stay tuned for job posting, candidate tracking & analytics.
// //         </p>

// //         <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
// //           <button
// //             onClick={() => navigate(-1)}
// //             className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-2 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
// //           >
// //             <Zap className="h-5 w-5" />
// //             Go Back
// //           </button>

// //           {isAuthenticated() && (
// //             <button
// //               onClick={handleLogout}
// //               className="inline-flex items-center gap-2 border border-red-200 bg-red-50 text-red-600 py-2 px-6 rounded-lg font-semibold hover:bg-red-100 transition-all"
// //             >
// //               <LogOut className="h-5 w-5" />
// //               Logout
// //             </button>
// //           )}
// //         </div>

// //       </div>
// //     </div>
// //   );
// // }
