import { useEffect, useState } from 'react';
import { Mail, Lock, User, Phone, Briefcase, Upload, Zap, Target } from 'lucide-react';
import head from '../assets/logo.png';
import landingImg from '../assets/landing.png';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";
import { googleLoginUser } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading,setLoading] = useState(false)
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
  });

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => Boolean(state.auth.accessToken));

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

    const Spinner = () => (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );

  const { login, register } = useAuth();

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await login(loginData.email, loginData.password);

    if (!res || res.success === false) {
      toast.error(res?.message || "Login failed");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate])

  const handleSignupSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (signupData.password !== confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  const res = await register(
    signupData.email,
    signupData.fullName,
    signupData.mobileNumber,
    signupData.password,
  );

  if (!res.success) {
    toast.error("Registration failed");
  }
};

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="grid lg:grid-cols-2 min-h-screen gap-0">
        <div className=" flex flex-col items-start px-4 sm:px-8 py-2 lg:min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500">
          <div className="relative z-10 text-center w-full max-w-md mx-auto py-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
              Upload Your Resume Once<br /> Get Discovered by Employers.
            </h1>

            <p className="text-lg sm:text-xl text-blue-100 mb-4 leading-relaxed">
              Resumewala helps job seekers get visibility to verified employers—without applying again and again.
            </p>

            <div className="flex justify-center">
              <img
                src={landingImg}
                alt="Landing Illustration"
                className="max-w-full sm:max-w-md lg:max-w-lg rounded-2xl shadow-2xl"
              />
            </div>

          </div>

        </div>

        <div className=" relative flex flex-col justify-center px-4 sm:px-8 py-12 lg:py-0">
          <img
            src={head}
            alt="Resumewala Logo"
            className="absolute top-6 left-6 h-16 sm:h-24 w-auto cursor-pointer"
            onClick={() => navigate('/')}
          />

          <div className="w-full max-w-md mx-auto mt-20">

            {/* <div className="lg:hidden text-center mb-8">
              <Briefcase className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Resumewala</h1>
              <p className="text-gray-600">Upload Resume. Get Opportunities.</p>

            </div> */}


            {isLogin ? (
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Welcome Back</h2>
                <p className="text-gray-600 text-center mb-8">Login to your account</p>

                {/* Google Login - TOP PRIORITY */}
<div className="mb-6">
  <GoogleLogin
    onSuccess={async (credentialResponse) => {
      try {
        await dispatch(googleLoginUser(credentialResponse.credential)).unwrap();
        navigate("/");
      } catch (error: any) {
        toast.error(error.message || "Google Login Failed");
      }
    }}
    onError={() => {
      toast.error("Google Login Failed");
    }}
  />
</div>

<div className="flex items-center my-6">
  <div className="flex-grow h-px bg-gray-300"></div>
  <span className="px-3 text-sm text-gray-500">OR</span>
  <div className="flex-grow h-px bg-gray-300"></div>
</div>
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all"
                  >
                    Login
                  </button>
                  <p
                    className="text-sm text-blue-600 cursor-pointer text-right"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot Password?
                  </p>

                </form>

                {/* <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    const res = await fetch(`${API_URL}/api/auth/google-login`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ credential: credentialResponse.credential })
                    });

                    const data = await res.json();

                    if (data.success) {
                      localStorage.setItem("token", data.token);
                      localStorage.setItem("user", JSON.stringify(data.user));
                      navigate("/");
                    }
                  }}
                  onError={() => {
                    toast.error("Google Login Failed");
                  }}
                />
 */}

                <div className="mt-6">
                  <p className="text-center text-gray-600">
                    Don't have an account?{' '}
                    <button
                      onClick={() => setIsLogin(false)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-semibold hover:opacity-90"
                      
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Create Account</h2>
                <p className="text-gray-600 text-center mb-8">Join Resumewala to start your job search</p>

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="fullName"
                        value={signupData.fullName}
                        onChange={handleSignupChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={signupData.email}
                        onChange={handleSignupChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={signupData.mobileNumber}
                        onChange={handleSignupChange}
                        required
                        pattern="[0-9]{10}"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        name="password"
                        value={signupData.password}
                        onChange={handleSignupChange}
                        required
                        minLength={6}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Min 6 characters"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold shadow-lg transition-all
                      ${
                        loading
                          ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700"
                      } text-white`}
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                <div className="mt-6">
                  <p className="text-center text-gray-600">
                    Already have an account?{' '}
                    <button
                      onClick={() => setIsLogin(true)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-semibold hover:opacity-90"

                    >
                      Login
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
