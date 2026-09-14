import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { verifyEmployerEmail } from "../../services/employerApi";
import toast from "react-hot-toast";

type Status = "loading" | "success" | "already_verified" | "expired" | "invalid" | "error";

export default function EmployerVerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setMessage("No verification token provided.");
      return;
    }

    verifyEmployerEmail(token)
      .then((data) => {
        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
        setTimeout(() => navigate("/employer/login"), 4000);
      })
      .catch((err) => {
        const data = err.response?.data;
        const code = data?.code;

        if (code === "ALREADY_VERIFIED") {
          setStatus("already_verified");
          setMessage(data.message);
        } else if (code === "TOKEN_EXPIRED") {
          setStatus("expired");
          setMessage(data.message);
          setCanResend(true);
          setEmail(data.email || "");
        } else if (code === "TOKEN_INVALID") {
          setStatus("invalid");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data?.message || "Something went wrong.");
          setCanResend(data?.canResend || false);
          setEmail(data?.email || "");
        }
      });
  }, [token]);

  const handleResend = async () => {
    if (!email) {
      toast.error("Email not found. Please register again.");
      return;
    }
    setResending(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/employer/resend-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
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

  const configs: Record<Status, {
    icon: string; iconBg: string; iconColor: string;
    title: string; color: string;
  }> = {
    loading: {
      icon: "⏳", iconBg: "bg-blue-100", iconColor: "text-blue-600",
      title: "Verifying your email...", color: "text-blue-600",
    },
    success: {
      icon: "✅", iconBg: "bg-green-100", iconColor: "text-green-600",
      title: "Email Verified!", color: "text-green-700",
    },
    already_verified: {
      icon: "✅", iconBg: "bg-green-100", iconColor: "text-green-600",
      title: "Already Verified", color: "text-green-700",
    },
    expired: {
      icon: "⏰", iconBg: "bg-orange-100", iconColor: "text-orange-600",
      title: "Link Expired", color: "text-orange-700",
    },
    invalid: {
      icon: "❌", iconBg: "bg-red-100", iconColor: "text-red-600",
      title: "Invalid Link", color: "text-red-700",
    },
    error: {
      icon: "⚠️", iconBg: "bg-yellow-100", iconColor: "text-yellow-600",
      title: "Verification Failed", color: "text-yellow-700",
    },
  };

  const cfg = configs[status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-200 text-center">

        {/* Icon */}
        <div className={`w-16 h-16 ${cfg.iconBg} rounded-full flex items-center justify-center mx-auto mb-5 text-3xl`}>
          {status === "loading" ? (
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            cfg.icon
          )}
        </div>

        <h1 className={`text-2xl font-bold mb-3 ${cfg.color}`}>{cfg.title}</h1>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">{message}</p>

        {/* Success — auto redirect */}
        {status === "success" && (
          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-700">
              Redirecting to login in 4 seconds...
            </div>
            <Link
              to="/employer/login"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition text-sm"
            >
              Go to Login Now
            </Link>
          </div>
        )}

        {/* Already verified */}
        {status === "already_verified" && (
          <Link
            to="/employer/login"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition text-sm"
          >
            Go to Login
          </Link>
        )}

        {/* Expired or error with resend option */}
        {(status === "expired" || (status === "error" && canResend)) && (
          <div className="space-y-3">
            {!resent ? (
              <button
                onClick={handleResend}
                disabled={resending}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition text-sm disabled:opacity-60"
              >
                {resending ? "Sending..." : "📧 Send New Verification Email"}
              </button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                ✅ New verification email sent! Check your inbox.
              </div>
            )}
            <Link
              to="/employer/register"
              className="block text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Register with a different email
            </Link>
          </div>
        )}

        {/* Invalid link */}
        {status === "invalid" && (
          <div className="space-y-3">
            <Link
              to="/employer/register"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition text-sm"
            >
              Register Again
            </Link>
            <Link
              to="/employer/login"
              className="block text-sm text-gray-500 hover:underline"
            >
              Already verified? Login here
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}