import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';

interface LoginProps {
  onNavigate: (page: string) => void;
  onLogin: (isAdmin: boolean) => void;
}

export default function Login({ onNavigate, onLogin }: LoginProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.email === 'admin@resumewala.com' && formData.password === 'admin123') {
      onLogin(true);
      onNavigate('admin');
    } else {
      onLogin(false);
      onNavigate('profile');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Welcome Back</h2>
          <p className="text-gray-600 text-center mb-8">Login to your account</p>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              Login
            </button>
          </form>

          <div className="mt-6">
            <p className="text-center text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-blue-500 hover:text-blue-600 font-semibold"
              >
                Register
              </button>
            </p>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              <strong>Demo Admin Login:</strong>
              <br />
              Email: admin@resumewala.com
              <br />
              Password: admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
