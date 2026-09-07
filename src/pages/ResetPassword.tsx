import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  employerMode?: boolean;
}

export default function ResetPassword({ employerMode }: Props) {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const endpoint = employerMode
        ? `${API_URL}/api/employer/reset-password/${token}`
        : `${API_URL}/api/auth/reset-password/${token}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success || res.ok) {
        toast.success("Password reset successful");
        navigate(employerMode ? "/employer/login" : "/");
      } else {
        toast.error(data.message || "Reset failed");
      }
    } catch (error) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
          Reset Password
        </h2>
        <p className="text-gray-600 text-center mb-6">
          {employerMode
            ? "Enter your new employer account password"
            : "Enter your new password"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <p
          onClick={() => navigate(employerMode ? "/employer/login" : "/")}
          className="text-center text-blue-600 mt-6 cursor-pointer hover:underline"
        >
          Back to Login
        </p>
      </div>
    </div>
  );
}