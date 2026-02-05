import { MapPin, Briefcase, Calendar, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Job } from '../types';
import browse from '../assets/browse.png';

interface JobsProps {
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
}

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'Tech Solutions Inc.',
    location: 'Mumbai, Maharashtra',
    experience: '3-5 years',
    description: 'We are looking for an experienced Frontend Developer to join our team.',
    requirements: ['React', 'TypeScript', 'Tailwind CSS'],
    salary: '₹8-12 LPA',
    jobType: 'Full-time',
    postedDate: '2024-01-15',
  },
  {
    id: '2',
    title: 'Backend Developer',
    company: 'Digital Innovations',
    location: 'Bangalore, Karnataka',
    experience: '2-4 years',
    description: 'Join our backend team to build scalable applications.',
    requirements: ['Node.js', 'MongoDB', 'Express'],
    salary: '₹6-10 LPA',
    jobType: 'Full-time',
    postedDate: '2024-01-14',
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    company: 'StartUp Hub',
    location: 'Pune, Maharashtra',
    experience: '1-3 years',
    description: 'Exciting opportunity for a full stack developer in a fast-growing startup.',
    requirements: ['React', 'Node.js', 'PostgreSQL'],
    salary: '₹5-8 LPA',
    jobType: 'Full-time',
    postedDate: '2024-01-13',
  },
];

export default function Jobs({ onNavigate, isLoggedIn }: JobsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filteredJobs = mockJobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApply = (job: Job) => {
    if (!isLoggedIn) {
      alert('Please login or register to apply for jobs');
      onNavigate('login');
    } else {
      alert(`Applied to ${job.title} at ${job.company}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

      {/* LEFT CONTENT */}
      <div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5">
          Find Jobs That Match <br className="hidden sm:block" />
          Your Skills
        </h1>

        <p className="text-blue-100 text-base sm:text-lg mb-8 max-w-xl">
          Explore verified jobs from top companies. Build your profile once and apply instantly.
        </p>

        {/* SEARCH BAR */}
        <div className="bg-white rounded-xl shadow-lg p-2 flex items-center gap-2 max-w-xl">
          <Search className="h-5 w-5 text-gray-400 ml-2" />

          <input
            type="text"
            placeholder="Job title, company, or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-2 py-3 text-gray-800 outline-none text-sm sm:text-base"
          />

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition">
            Search
          </button>
        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div className="hidden md:flex justify-center">
        <img
          src={browse}
          alt="Browse Jobs"
          className="max-h-64 lg:max-h-72 w-auto object-contain"
        />
      </div>

    </div>
  </div>
</div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredJobs.length}</span> jobs
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 cursor-pointer"
              onClick={() => setSelectedJob(job)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{job.title}</h2>
                  <p className="text-blue-500 font-semibold">{job.company}</p>
                </div>
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  {job.jobType}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Briefcase className="h-4 w-4 mr-2" />
                  <span>{job.experience}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                </div>
              </div>

              {job.salary && (
                <p className="text-lg font-bold text-gray-800 mb-4">{job.salary}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {job.requirements.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApply(job);
                }}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>

        {selectedJob && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedJob(null)}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedJob.title}</h2>
                  <p className="text-blue-500 font-semibold text-xl">{selectedJob.company}</p>
                </div>
                <button onClick={() => setSelectedJob(null)}>
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{selectedJob.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Briefcase className="h-5 w-5 mr-2" />
                  <span>{selectedJob.experience}</span>
                </div>
                {selectedJob.salary && (
                  <p className="text-xl font-bold text-gray-800">{selectedJob.salary}</p>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Job Description</h3>
                <p className="text-gray-600">{selectedJob.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.requirements.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleApply(selectedJob)}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  Apply Now
                </button>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
