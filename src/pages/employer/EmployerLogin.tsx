import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginEmployer } from "../../services/employerApi";
import { useEmployer } from "../../context/EmployerContext";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function EmployerLogin() {
  const { login } = useEmployer();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // ── Status states ────────────────────────────────────────────
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [rejectedMsg, setRejectedMsg] = useState("");
  const [blockedMsg, setBlockedMsg] = useState("");

  const resetStatusStates = () => {
    setShowResend(false);
    setResendEmail("");
    setResent(false);
    setPendingApproval(false);
    setRejectedMsg("");
    setBlockedMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetStatusStates();

    try {
      const data = await loginEmployer(form);

      // ✅ Save token then update context
      localStorage.setItem("employerToken", data.token);
      login(data.token, data.employer);
      toast.success(`Welcome back, ${data.employer.recruiterName}!`);
      navigate("/employer/dashboard");
    } catch (err: any) {
      const data = err.response?.data;
      const code = data?.code;
      const msg = data?.message || "Login failed.";

      if (code === "EMAIL_NOT_VERIFIED") {
        // Show resend verification option
        toast.error("Please verify your email first.", { duration: 4000 });
        setShowResend(true);
        setResendEmail(form.email);
      } else if (code === "PENDING_APPROVAL") {
        // Show pending approval info
        toast.error("Account pending admin approval.", { duration: 4000 });
        setPendingApproval(true);
      } else if (code === "ACCOUNT_REJECTED") {
        setRejectedMsg(msg);
        toast.error(msg, { duration: 6000 });
      } else if (code === "ACCOUNT_BLOCKED") {
        setBlockedMsg(msg);
        toast.error(msg, { duration: 6000 });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch(`${API_URL}/api/employer/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResent(true);
      toast.success("Verification email sent! Check your inbox.");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Employer Login</h1>
          <p className="text-gray-500 text-sm mt-1">Access your hiring dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Work Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-right">
            <Link
              to="/employer/forgot-password"
              className="text-xs text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* ── Email not verified — resend option ─────────────── */}
        {showResend && (
          <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-800 mb-1">
              📧 Email Not Verified
            </p>
            <p className="text-xs text-amber-700 mb-3">
              Please verify your email before logging in. Check your inbox or
              request a new verification link.
            </p>
            {resent ? (
              <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 font-medium">
                ✅ Verification email sent! Check your inbox and spam folder.
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-60"
              >
                {resending ? "Sending..." : "📧 Resend Verification Email"}
              </button>
            )}
          </div>
        )}

        {/* ── Pending admin approval ─────────────────────────── */}
        {pendingApproval && (
          <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">
              ⏳ Account Pending Approval
            </p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Your email is verified and your account is under review by our
              admin team. You will receive an email once approved. This usually
              takes up to 24 hours.
            </p>
          </div>
        )}

        {/* ── Account rejected ───────────────────────────────── */}
        {rejectedMsg && (
          <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-red-700 mb-1">
              ❌ Account Not Approved
            </p>
            <p className="text-xs text-red-600 leading-relaxed">{rejectedMsg}</p>
            <p className="text-xs text-red-500 mt-2">
              Contact us at{" "}
              <a
                href="mailto:support@resumewala.co.in"
                className="underline hover:text-red-700"
              >
                support@resumewala.co.in
              </a>{" "}
              if you think this is a mistake.
            </p>
          </div>
        )}

        {/* ── Account blocked ────────────────────────────────── */}
        {blockedMsg && (
          <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-red-700 mb-1">
              🚫 Account Suspended
            </p>
            <p className="text-xs text-red-600 leading-relaxed">{blockedMsg}</p>
            <p className="text-xs text-red-500 mt-2">
              Contact support at{" "}
              <a
                href="mailto:support@resumewala.co.in"
                className="underline hover:text-red-700"
              >
                support@resumewala.co.in
              </a>
            </p>
          </div>
        )}

        {/* Footer links */}
        <p className="text-center text-sm text-gray-500 mt-6">
          New employer?{" "}
          <Link
            to="/employer/register"
            className="text-blue-600 font-medium hover:underline"
          >
            Register here
          </Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          Job seeker?{" "}
          <Link to="/login" className="hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}






// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { loginEmployer } from "../../services/employerApi";
// import { useEmployer } from "../../context/EmployerContext";
// import toast from "react-hot-toast";

// export default function EmployerLogin() {
//   const { login } = useEmployer();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const data = await loginEmployer(form);
//       login(data.token, data.employer);
//       toast.success(`Welcome back, ${data.employer.recruiterName}!`);
//       navigate("/employer/dashboard");
//     } catch (err: any) {
//       toast.error(err.response?.data?.message || "Login failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
//       <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
//         <div className="text-center mb-8">
//           <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
//             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//             </svg>
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900">Employer Login</h1>
//           <p className="text-gray-500 text-sm mt-1">Access your hiring dashboard</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
//             <input
//               type="email" required placeholder="you@company.com"
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
//             <input
//               type="password" required placeholder="••••••••"
//               value={form.password}
//               onChange={(e) => setForm({ ...form, password: e.target.value })}
//               className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div className="text-right">
//             <Link to="/employer/forgot-password" className="text-xs text-blue-600 hover:underline">
//               Forgot password?
//             </Link>
//           </div>
//           <button
//             type="submit" disabled={loading}
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
//           >
//             {loading ? "Signing in..." : "Sign In"}
//           </button>
//         </form>

//         <p className="text-center text-sm text-gray-500 mt-6">
//           New employer?{" "}
//           <Link to="/employer/register" className="text-blue-600 font-medium hover:underline">
//             Register here
//           </Link>
//         </p>
//         <p className="text-center text-xs text-gray-400 mt-2">
//           Job seeker?{" "}
//           <Link to="/login" className="hover:underline">Login here</Link>
//         </p>
//       </div>
//     </div>
//   );
// }