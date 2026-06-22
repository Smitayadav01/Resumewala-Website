import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEmployerAuth } from '../context/EmployerAuthContext';
import { getEmployerDashboard } from '../services/employerApi';
import {
  Briefcase, Users, Plus, Settings, LogOut, CheckCircle,
  TrendingUp, Clock, ChevronRight, AlertCircle, Star, CreditCard
} from 'lucide-react';

interface DashboardStats {
  totalActiveJobs: number;
  totalApplications: number;
  profileCompletionPercent: number;
  recentApplications: any[];
  subscription: { plan: string; jobCredits: number; expiresAt: string | null };
  isVerifiedBadge: boolean;
  companyName: string;
  companyLogo: string;
}

const statusColors: Record<string, string> = {
  Applied: 'bg-blue-100 text-blue-700',
  Shortlisted: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  Contacted: 'bg-purple-100 text-purple-700',
};

export default function EmployerDashboard() {
  const { employer, logout } = useEmployerAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployerDashboard()
      .then(res => setStats(res.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/employer/login'); };

  const daysLeft = stats?.subscription?.expiresAt
    ? Math.max(0, Math.ceil((new Date(stats.subscription.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {stats?.companyLogo ? (
                <img src={stats.companyLogo} alt="logo" className="w-14 h-14 rounded-xl object-cover bg-white" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {stats?.companyName?.[0]}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold">{stats?.companyName}</h1>
                <p className="text-blue-200 text-sm">Welcome back, {employer?.recruiterName}</p>
              </div>
            </div>
            <Link to="/employer/post-job"
              className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-50 transition text-sm">
              <Plus className="w-4 h-4" /> Post a Job
            </Link>
          </div>
        </div>

        {/* Subscription Alert */}
        {stats?.subscription?.plan === 'none' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-amber-800 text-sm font-medium">You don't have an active plan. Purchase a subscription to post jobs.</p>
            </div>
            <Link to="/employer/pricing" className="text-sm font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-lg transition whitespace-nowrap">
              View Plans
            </Link>
          </div>
        )}

        {/* Profile Completion */}
        {(stats?.profileCompletionPercent || 0) < 100 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Profile Completion</span>
              <span className="text-sm font-bold text-blue-600">{stats?.profileCompletionPercent}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${stats?.profileCompletionPercent}%` }} />
            </div>
            <Link to="/employer/profile" className="text-xs text-blue-600 hover:underline mt-2 inline-block">Complete your profile →</Link>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard icon={<Briefcase className="w-5 h-5 text-blue-600" />} label="Active Jobs" value={stats?.totalActiveJobs ?? 0} bg="bg-blue-50" />
          <StatCard icon={<Users className="w-5 h-5 text-green-600" />} label="Total Applications" value={stats?.totalApplications ?? 0} bg="bg-green-50" />
          <StatCard
            icon={<CreditCard className="w-5 h-5 text-purple-600" />}
            label="Job Credits"
            value={stats?.subscription?.plan === 'premium' ? '∞' : (stats?.subscription?.jobCredits ?? 0)}
            bg="bg-purple-50"
            sub={stats?.subscription?.plan !== 'none' ? stats?.subscription?.plan?.toUpperCase() : 'No Plan'}
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-orange-600" />}
            label="Plan Expires"
            value={daysLeft !== null ? `${daysLeft}d` : '—'}
            bg="bg-orange-50"
            sub={daysLeft !== null ? 'days remaining' : 'No active plan'}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Post New Job', icon: <Plus className="w-5 h-5" />, to: '/employer/post-job', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
            { label: 'Manage Jobs', icon: <Briefcase className="w-5 h-5" />, to: '/employer/manage-jobs', color: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200' },
            { label: 'View Applicants', icon: <Users className="w-5 h-5" />, to: '/employer/applicants', color: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200' },
            { label: 'Edit Profile', icon: <Settings className="w-5 h-5" />, to: '/employer/profile', color: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200' },
          ].map(action => (
            <Link key={action.label} to={action.to}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl font-semibold text-sm transition text-center ${action.color}`}>
              {action.icon}
              {action.label}
            </Link>
          ))}
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Applications</h2>
            <Link to="/employer/applicants" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {!stats?.recentApplications?.length ? (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No applications yet. Post a job to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats.recentApplications.map((app: any) => (
                <div key={app._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{app.candidateName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {app.job?.jobTitle} · {new Date(app.appliedAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[app.status] || 'bg-gray-100 text-gray-600'}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bg, sub }: { icon: React.ReactNode; label: string; value: string | number; bg: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}