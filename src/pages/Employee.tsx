import { Routes, Route } from "react-router-dom";
import Layout from '../components/EmployeeLayout';

import Dashboard from "./Dashboard";
import Jobs from "./Jobs";
import Candidates from "./Candidates";
import Analytics from "./Analytics";
import Settings from "./Settings";

function Employee() {
  return (
    <Layout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="candidates" element={<Candidates />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

export default Employee;



// import { Briefcase, Zap } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// export default function EmployeeComingSoon() {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      
//       <div className="text-center max-w-lg p-10 bg-white rounded-3xl shadow-xl border border-gray-100">

//         {/* Icon */}
//         <div className="flex justify-center mb-6">
//           <div className="p-4 bg-blue-100 rounded-full">
//             <Briefcase className="h-10 w-10 text-blue-600" />
//           </div>
//         </div>

//         {/* Heading */}
//         <h1 className="text-4xl font-bold text-gray-900 mb-4">
//           Employee Dashboard
//         </h1>

//         {/* Message */}
//         <p className="text-gray-600 text-lg mb-6">
//           🚀 We’re building something amazing for employers. <br />
//           This feature will be live very soon!
//         </p>

//         {/* Extra line */}
//         <p className="text-sm text-gray-400 mb-8">
//           Stay tuned for job posting, candidate tracking & analytics.
//         </p>

//         {/* Button */}
//         <button
//           onClick={() => navigate(-1)}
//           className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-2 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
//         >
//           <Zap className="h-5 w-5" />
//           Go Back
//         </button>

//       </div>
//     </div>
//   );
// }