import { Plus, Search, MoreVertical, MapPin, Clock, DollarSign } from 'lucide-react';

const Jobs = () => {
  const jobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salary: '$120k - $160k',
      posted: '2 days ago',
      applications: 89,
      status: 'Active',
    },
    {
      id: 2,
      title: 'Product Designer',
      department: 'Design',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$100k - $140k',
      posted: '5 days ago',
      applications: 67,
      status: 'Active',
    },
    {
      id: 3,
      title: 'Backend Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$130k - $170k',
      posted: '1 week ago',
      applications: 54,
      status: 'Active',
    },
    {
      id: 4,
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Los Angeles, CA',
      type: 'Full-time',
      salary: '$90k - $120k',
      posted: '2 weeks ago',
      applications: 43,
      status: 'Active',
    },
    {
      id: 5,
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salary: '$110k - $150k',
      posted: '3 weeks ago',
      applications: 28,
      status: 'Closed',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-600 mt-1">Manage your active and past job listings</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <Plus className="w-5 h-5 mr-2" />
          Post New Job
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Design</option>
              <option>Marketing</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>All Status</option>
              <option>Active</option>
              <option>Closed</option>
              <option>Draft</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {jobs.map((job) => (
            <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      job.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {job.type}
                    </span>
                    <span className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {job.salary}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">
                      <span className="font-semibold text-gray-900">{job.applications}</span> applications
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">Posted {job.posted}</span>
                  </div>
                </div>
                <button className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 flex space-x-3">
                <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  View Applications
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  Edit Job
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  View Analytics
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
