import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEmployerAuth } from '../context/EmployerAuthContext';
import { Mail, Lock, Eye, EyeOff, Building2 } from 'lucide-react';

export default function EmployerLogin() {
  const navigate = useNavigate();
  const { login } = useEmployerAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/employer/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/">
            <span className="text-2xl font-extrabold text-blue-600">RESUMEWALA</span>
          </Link>
          <div className="mt-4 w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Employer Login</h1>
          <p className="text-gray-500 text-sm mt-1">Access your recruiter dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="hr@company.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Link to="/employer/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/employer/register" className="text-blue-600 hover:underline font-medium">Register as Employer</Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          Looking for a job?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">Candidate Login</Link>
        </p>
      </div>
    </div>
  );
}