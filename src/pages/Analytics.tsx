import { TrendingUp, Users, Eye, Clock } from 'lucide-react';

const Analytics = () => {
  const metrics = [
    {
      name: 'Total Applications',
      value: '1,428',
      change: '+12.5%',
      icon: Users,
      color: 'blue',
    },
    {
      name: 'Page Views',
      value: '24,567',
      change: '+8.2%',
      icon: Eye,
      color: 'green',
    },
    {
      name: 'Avg. Time to Hire',
      value: '18 days',
      change: '-3.1%',
      icon: Clock,
      color: 'purple',
    },
    {
      name: 'Conversion Rate',
      value: '8.4%',
      change: '+2.4%',
      icon: TrendingUp,
      color: 'orange',
    },
  ];

  const topSources = [
    { name: 'LinkedIn', applications: 487, percentage: 34 },
    { name: 'Indeed', applications: 342, percentage: 24 },
    { name: 'Company Website', applications: 285, percentage: 20 },
    { name: 'Referrals', applications: 214, percentage: 15 },
    { name: 'Other', applications: 100, percentage: 7 },
  ];

  const monthlyData = [
    { month: 'Jan', applications: 120, hires: 8 },
    { month: 'Feb', applications: 150, hires: 12 },
    { month: 'Mar', applications: 180, hires: 15 },
    { month: 'Apr', applications: 165, hires: 11 },
    { month: 'May', applications: 200, hires: 18 },
    { month: 'Jun', applications: 220, hires: 20 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Track your hiring performance and metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            orange: 'bg-orange-100 text-orange-600',
          }[metric.color];

          return (
            <div key={metric.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${colorClasses}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-green-600">{metric.change}</span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
                <p className="text-sm text-gray-600 mt-1">{metric.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Applications & Hires Trend</h2>
          </div>
          <div className="p-6">
            <div className="h-80 flex items-end justify-between space-x-4">
              {monthlyData.map((data, index) => {
                const maxValue = Math.max(...monthlyData.map(d => d.applications));
                const applicationHeight = (data.applications / maxValue) * 100;
                const hireHeight = (data.hires / maxValue) * 100;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex justify-center space-x-1 mb-2" style={{ height: '280px', alignItems: 'flex-end' }}>
                      <div
                        className="w-1/2 bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                        style={{ height: `${applicationHeight}%` }}
                        title={`${data.applications} applications`}
                      ></div>
                      <div
                        className="w-1/2 bg-green-500 rounded-t transition-all hover:bg-green-600"
                        style={{ height: `${hireHeight * 10}%` }}
                        title={`${data.hires} hires`}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">{data.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center space-x-6 mt-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Applications</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Hires</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Sources</h2>
          </div>
          <div className="p-6 space-y-4">
            {topSources.map((source, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{source.name}</span>
                  <span className="text-sm text-gray-600">{source.applications}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${source.percentage}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-500">{source.percentage}% of total</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
