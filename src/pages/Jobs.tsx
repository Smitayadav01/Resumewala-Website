import { MapPin, Briefcase, Calendar, Search, X, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Job } from '../types';
import browse from '../assets/browse.png';
import { toast } from "sonner";
import { authFetch } from '../services/apiClient';
const API_URL = import.meta.env.VITE_API_URL;
export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [appliedJobTitle, setAppliedJobTitle] = useState('');
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/jobs`);
      const data = await res.json();
      setJobs(data.jobs);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
  try {
    const res = await authFetch('/api/jobs/applied');

    const data = await res.json();

    if (res.ok) {
      setAppliedJobIds(new Set(data.jobIds)); // ✅ KEY LINE
    }

  } catch (err) {
    console.error("Error fetching applied jobs:", err);
  }
};

  useEffect(() => {
  fetchJobs();
  fetchAppliedJobs(); // ✅ ADD THIS
}, []);

  const filteredJobs = jobs.filter((job) =>
  (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
  (job.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
  (job.location || '').toLowerCase().includes(searchTerm.toLowerCase())
);

  const handleApply = async (job: Job, fromModal = false) => {;
  
  const profileRes = await authFetch('/api/profile');

  if (profileRes.status === 401) {
    toast.error('Please login first');
    return;
  }

  if (appliedJobIds.has(job._id)) {
    return;
  }
  
  if (applyingJobId === job._id) {
    return;
  }

  setApplyingJobId(job._id);

  try {
    const profileData = await profileRes.json();

    if (!profileRes.ok) {
      throw new Error('Could not load profile');
    }

    const formData = new FormData();
    formData.append('jobId', job._id);
    formData.append('personalInfo', JSON.stringify(profileData.personal || {}));
    formData.append('experiences', JSON.stringify(profileData.experience || []));
    formData.append('education', JSON.stringify(profileData.education || []));
    formData.append('skills', JSON.stringify(profileData.skills || []));

    const res = await authFetch('/api/jobs/apply', {
      method: 'POST',
      body: formData,
    });
    
    const resData = await res.json();

    if (!res.ok) {
      
      throw new Error(resData.message || 'Failed to apply');
      
    }

    setAppliedJobIds(prev => new Set(prev).add(job._id));
    if (fromModal) {
      setAppliedJobTitle(job.title);
      setSelectedJob(null);
      setShowSuccessModal(true);
    } else {
      toast.success(`Applied successfully for ${job.title}!`);
    }

  } catch (err: any) {
    console.error("🔴 Apply error:", err);
    
    toast.error(err.message || 'Something went wrong');
  } finally {
    setApplyingJobId(null);
  }
}; 
  const ApplyButton = ({
    job,
    fromModal = false,
    extraClass = '',
  }: {
    job: Job;
    fromModal?: boolean;
    extraClass?: string;
  }) => {
    const alreadyApplied = appliedJobIds.has(job._id);
    const isApplying = applyingJobId === job._id;

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleApply(job, fromModal);
        }}
        disabled={alreadyApplied || isApplying}
        className={`flex items-center justify-center gap-2 font-semibold rounded-lg transition-all ${extraClass} ${
          alreadyApplied
            ? 'bg-green-50 text-green-700 border border-green-200 cursor-not-allowed'
            : isApplying
            ? 'bg-blue-400 text-white cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
        }`}
      >
        {alreadyApplied ? (
          <><CheckCircle size={16} /> Applied</>
        ) : isApplying ? (
          <><Loader2 size={16} className="animate-spin" /> Applying...</>
        ) : (
          'Apply Now'
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5">
                Find Jobs That Match <br className="hidden sm:block" />
                Your Skills
              </h1>
              <p className="text-blue-100 text-base sm:text-lg mb-8 max-w-xl">
                Explore verified jobs from top companies. Build your profile once and apply instantly.
              </p>
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
            <div className="hidden md:flex justify-center">
              <img src={browse} alt="Browse Jobs" className="max-h-64 lg:max-h-72 w-auto object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* JOB LIST */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <p className="text-gray-600 text-sm sm:text-base">
                Showing <span className="font-semibold text-gray-800">{filteredJobs.length}</span> jobs
              </p>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No jobs match your search.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                {filteredJobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 cursor-pointer group"
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition">
                          {job.title}
                        </h2>
                        <p className="text-blue-600 font-medium">{job.company}</p>
                      </div>
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                        {job.jobType}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{job.location}</div>
                      <div className="flex items-center"><Briefcase className="h-4 w-4 mr-2" />{job.experience}</div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(job.postedDate).toLocaleDateString()}
                      </div>
                    </div>

                    {job.salary && (
                      <p className="text-lg font-bold text-gray-900 mb-4">{job.salary}</p>
                    )}

                    <div className="mb-5">
  <p className="text-sm text-gray-600 leading-relaxed break-words">
    {job.requirements?.slice(0, 3).join(' • ')}
  </p>
</div>

                    <ApplyButton job={job} fromModal={false} extraClass="w-full py-2.5" />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* JOB DETAIL MODAL */}
      {selectedJob && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">{selectedJob.title}</h2>
                <p className="text-blue-600 font-semibold text-lg">{selectedJob.company}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-gray-500 hover:text-gray-700 transition">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-3 mb-6 text-gray-600">
              <div className="flex items-center"><MapPin className="h-5 w-5 mr-2" />{selectedJob.location}</div>
              <div className="flex items-center"><Briefcase className="h-5 w-5 mr-2" />{selectedJob.experience}</div>
              {selectedJob.salary && (
                <p className="text-xl font-bold text-gray-900">{selectedJob.salary}</p>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Job Description</h3>
              <p className="text-gray-600 leading-relaxed">{selectedJob.description}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-3">
                {selectedJob.requirements?.map((skill, index) => (
                  <span key={index} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium break-words max-w-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <ApplyButton job={selectedJob} fromModal={true} extraClass="flex-1 py-3" />
              <button
                onClick={() => setSelectedJob(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl text-center shadow-2xl max-w-sm w-full mx-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-500" size={36} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Application Sent!</h3>
            <p className="text-gray-600 mb-6">
              You've successfully applied for{' '}
              <span className="font-semibold text-gray-800">{appliedJobTitle}</span>.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold w-full"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
