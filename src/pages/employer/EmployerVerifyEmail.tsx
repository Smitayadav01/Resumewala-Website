import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { verifyEmployerEmail } from "../../services/employerApi";

export default function EmployerVerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    verifyEmployerEmail(token)
      .then((data) => {
        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
        // Auto redirect to login after 3 seconds
        setTimeout(() => navigate("/employer/login"), 3000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Invalid or expired verification link."
        );
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-200 text-center">

        {status === "loading" && (
          <>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Verifying your email...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-2">{message}</p>
            <p className="text-sm text-gray-400">Redirecting to login in 3 seconds...</p>
            <button
              onClick={() => navigate("/employer/login")}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition"
            >
              Go to Login Now
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate("/employer/register")}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-lg transition"
            >
              Back to Register
            </button>
          </>
        )}

      </div>
    </div>
  );
}