import { useState } from 'react';
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';

interface RegisterProps {
  onNavigate: (page: string) => void;
}

export default function Register({ onNavigate }: RegisterProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    alert('OTP sent to ' + formData.mobile);
    setStep(2);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    alert('OTP verified successfully');
    setStep(3);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    alert('Registration successful! Please login.');
    onNavigate('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Register as Candidate
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Create your profile to start applying for jobs
          </p>

          <div className="flex justify-between mb-8">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                1
              </div>
              <span className="text-xs mt-1 text-gray-600">Details</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className={`h-1 w-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
            </div>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                2
              </div>
              <span className="text-xs mt-1 text-gray-600">Verify</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className={`h-1 w-full ${step >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`} />
            </div>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                3
              </div>
              <span className="text-xs mt-1 text-gray-600">Password</span>
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
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
                    value={formData.email}
                    onChange={handleChange}
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
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <span>Send OTP</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Enter OTP</label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{6}"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
                <p className="text-sm text-gray-600 mt-2">
                  OTP sent to {formData.mobile}
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <span>Verify OTP</span>
                <ArrowRight className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-blue-500 hover:text-blue-600 font-medium"
              >
                Change Mobile Number
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password"
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
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Complete Registration
              </button>
            </form>
          )}

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-blue-500 hover:text-blue-600 font-semibold"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
