import { MapPin, Briefcase, Calendar, Search, X,CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Job } from '../types';

import { toast } from "react-toastify";

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 🔥 Fetch Jobs from Backend
  const fetchJobs = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/jobs");
    const data = await res.json();
    setJobs(data.jobs);
  } catch (error) {
    console.error("Fetch error:", error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchJobs();
}, []);



  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );


const handleApply = async (job: Job, fromModal = false) => {
  const token = localStorage.getItem('token');
  if (!token) {
    toast.error('Please login first');
    return;
  }

  try {
    const profileRes = await fetch('http://localhost:5000/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const profileData = await profileRes.json();

    const formData = new FormData();
    formData.append('jobId', job._id);
    formData.append('personalInfo', JSON.stringify(profileData.personal || {}));
    formData.append('experiences', JSON.stringify(profileData.experience || []));
    formData.append('education', JSON.stringify(profileData.education || []));
    formData.append('skills', JSON.stringify(profileData.skills || []));

    if (profileData.resumeUrl) {
      const resumeBlob = await fetch(profileData.resumeUrl).then(r => r.blob());
      formData.append('resume', resumeBlob, 'resume.pdf');
    }

    const res = await fetch('http://localhost:5000/api/jobs/apply', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to apply');
    }

    // ✅ Show success based on where apply was triggered
    if (fromModal) {
      // opened from job detail modal → show center modal
      setSelectedJob(job);
      setShowSuccessModal(true);
    } else {
      // clicked from job card → show small toast only
      toast.success(`Applied successfully for ${job.title}`);
    }

  } catch (err: any) {
    console.error(err);
    toast.error(err.message || 'Something went wrong');
  }
};



  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

            {/* LEFT */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5">
                Find Jobs That Match <br className="hidden sm:block" />
                Your Skills
              </h1>

              <p className="text-blue-100 text-base sm:text-lg mb-8 max-w-xl">
                Explore verified jobs from top companies. Build your profile once and apply instantly.
              </p>

              {/* SEARCH */}
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
          Showing{" "}
          <span className="font-semibold text-gray-800">
            {filteredJobs.length}
          </span>{" "}
          jobs
        </p>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">
            No jobs match your search.
          </p>
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
                  <p className="text-blue-600 font-medium">
                    {job.company}
                  </p>
                </div>

                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                  {job.jobType}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {job.location}
                </div>

                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  {job.experience}
                </div>

                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(job.postedDate).toLocaleDateString()}
                </div>
              </div>

              {job.salary && (
                <p className="text-lg font-bold text-gray-900 mb-4">
                  {job.salary}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-5">
                {job.requirements?.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>

             <button
  onClick={(e) => {
    e.stopPropagation();
    handleApply(job, false);
  }}
  className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-semibold"
>
  Apply Now
</button>

            </div>
          ))}
        </div>
         )}
    </>
  )}
</div>
  

        {/* MODAL */}
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
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            {selectedJob.title}
          </h2>
          <p className="text-blue-600 font-semibold text-lg">
            {selectedJob.company}
          </p>
        </div>

        <button
          onClick={() => setSelectedJob(null)}
          className="text-gray-500 hover:text-gray-700 transition"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="space-y-3 mb-6 text-gray-600">
        <div className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          {selectedJob.location}
        </div>

        <div className="flex items-center">
          <Briefcase className="h-5 w-5 mr-2" />
          {selectedJob.experience}
        </div>

        {selectedJob.salary && (
          <p className="text-xl font-bold text-gray-900">
            {selectedJob.salary}
          </p>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Job Description
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {selectedJob.description}
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Required Skills
        </h3>
        <div className="flex flex-wrap gap-3">
          {selectedJob.requirements?.map((skill, index) => (
            <span
              key={index}
              className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
  onClick={() => handleApply(selectedJob!, true)} // true = clicked from modal
  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
>
  Apply Now
</button>


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
{showSuccessModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl text-center">
      <CheckCircle className="text-green-600 mx-auto mb-2" />
      <p>Applied successfully for {selectedJob?.title}</p>
      <button
        onClick={() => setShowSuccessModal(false)}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg mt-4"
      >
        Close
      </button>
    </div>
  </div>
)}

      </div>
  );
}
