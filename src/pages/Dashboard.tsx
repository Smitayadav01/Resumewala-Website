import { TrendingUp, TrendingDown, Users, Briefcase, Eye, CheckCircle } from 'lucide-react';
import Jobs from "./Jobs";
import Candidates from "./Candidates";
import Analytics from "./Analytics";
import Settings from "./Settings";

const Dashboard = () => {
  const stats = [
    {
      name: 'Active Jobs',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: Briefcase,
      color: 'blue',
    },
    {
      name: 'Total Applications',
      value: '1,428',
      change: '+18%',
      trend: 'up',
      icon: Users,
      color: 'green',
    },
    {
      name: 'Shortlisted',
      value: '142',
      change: '+8%',
      trend: 'up',
      icon: CheckCircle,
      color: 'purple',
    },
    {
      name: 'Profile Views',
      value: '3,842',
      change: '-3%',
      trend: 'down',
      icon: Eye,
      color: 'orange',
    },
  ];

  const recentApplications = [
    {
      id: 1,
      candidate: 'John Smith',
      position: 'Senior Frontend Developer',
      appliedDate: '2 hours ago',
      status: 'Under Review',
      experience: '5 years',
    },
    {
      id: 2,
      candidate: 'Sarah Johnson',
      position: 'Product Designer',
      appliedDate: '5 hours ago',
      status: 'Shortlisted',
      experience: '3 years',
    },
    {
      id: 3,
      candidate: 'Michael Chen',
      position: 'Backend Engineer',
      appliedDate: '1 day ago',
      status: 'Interview Scheduled',
      experience: '7 years',
    },
    {
      id: 4,
      candidate: 'Emily Davis',
      position: 'Marketing Manager',
      appliedDate: '2 days ago',
      status: 'Under Review',
      experience: '4 years',
    },
  ];

  const topJobs = [
    { title: 'Senior Frontend Developer', applications: 89, views: 432 },
    { title: 'Product Designer', applications: 67, views: 389 },
    { title: 'Backend Engineer', applications: 54, views: 298 },
    { title: 'Marketing Manager', applications: 43, views: 267 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your hiring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            orange: 'bg-orange-100 text-orange-600',
          }[stat.color];

          return (
            <div key={stat.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${colorClasses}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-1">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm text-gray-600 mt-1">{stat.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {application.candidate.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{application.candidate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{application.position}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-600">{application.experience}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-600">{application.appliedDate}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        application.status === 'Shortlisted'
                          ? 'bg-green-100 text-green-800'
                          : application.status === 'Interview Scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {application.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Performing Jobs</h2>
          </div>
          <div className="p-6 space-y-4">
            {topJobs.map((job, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">{job.title}</h3>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{job.applications} applications</span>
                  <span>{job.views} views</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(job.applications / 100) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
