import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { employerRegister } from '../services/employerApi';
import { Building2, User, Mail, Phone, MapPin, Globe, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function EmployerRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: '', recruiterName: '', email: '', mobile: '',
    companyLocation: '', companyWebsite: '', password: '', confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await employerRegister(data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            We've sent a verification link to <strong>{form.email}</strong>. Please verify your email to continue.
          </p>
          <p className="text-sm text-gray-500">After verification, your account will be reviewed by our admin team.</p>
          <Link to="/employer/login" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-2xl font-extrabold text-blue-600">RESUMEWALA</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Register as Employer</h1>
          <p className="text-gray-500 mt-1">Find the right talent for your company</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input name="companyName" value={form.companyName} onChange={handleChange} required
                placeholder="Acme Corp" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          {/* Recruiter Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recruiter Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input name="recruiterName" value={form.recruiterName} onChange={handleChange} required
                placeholder="Rahul Sharma" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Official Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="hr@company.com" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input name="mobile" value={form.mobile} onChange={handleChange} required
                placeholder="+91 98765 43210" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          {/* Company Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Location *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input name="companyLocation" value={form.companyLocation} onChange={handleChange} required
                placeholder="Mumbai, Maharashtra" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Website <span className="text-gray-400">(optional)</span></label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input name="companyWebsite" value={form.companyWebsite} onChange={handleChange}
                placeholder="https://yourcompany.com" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required
                placeholder="Min 6 characters" className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required
                placeholder="Repeat password" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Creating account...' : 'Create Employer Account'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/employer/login" className="text-blue-600 hover:underline font-medium">Login</Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          Looking for a job?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">Register as Candidate</Link>
        </p>
      </div>
    </div>
  );
}