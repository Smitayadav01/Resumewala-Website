import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Users, Briefcase, Download, X } from 'lucide-react';
import { Job } from '../types';
import { toast } from 'sonner';

interface Candidate {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  skills: string[];
  resumeUrl: string;
  userId: string;
}


export default function Admin() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates'>('jobs');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    experience: '',
    description: '',
    requirements: '',
    salary: '',
    jobType: 'Full-time',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const [jobs, setJobs] = useState<Job[]>([]);
const fetchJobs = async () => {
  try {
    const res = await fetch("https://resumewala.co.in/api/jobs");
    const data = await res.json();
    setJobs(data.jobs);
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchJobs();
}, []);


  const openJobModal = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title,
        company: job.company,
        location: job.location,
        experience: job.experience,
        description: job.description,
        requirements: job.requirements.join(', '),
        salary: job.salary || '',
        jobType: job.jobType,
      });
    } else {
      setEditingJob(null);
      setFormData({
        title: '',
        company: '',
        location: '',
        experience: '',
        description: '',
        requirements: '',
        salary: '',
        jobType: 'Full-time',
      });
    }
    setShowJobModal(true);
  };
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoadingCandidates(true);
        const token = localStorage.getItem("token");
        const res = await fetch("https://resumewala.co.in/api/admin/profiles", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch profiles");
        }
        // 🔥 MAP BACKEND → FRONTEND
        const mappedCandidates: Candidate[] = data.profiles.map((profile: any) => ({
          id:  profile._id,
          userId: profile.userId ,
          fullName: profile.personal.fullName,
          email: profile.personal.email,
          mobile: profile.personal.mobileNumbers,
          skills: profile.skills || [],
          resumeUrl: profile.resumeUrl || "#",
        }));
        console.log(mappedCandidates)

        setCandidates(mappedCandidates);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);

      } finally {
        setLoadingCandidates(false);
      }
    };

    fetchCandidates();
  }, []);

  const downloadResume = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      console.log(id)
      const res = await fetch(
        `https://resumewala.co.in/api/admin/download-resume/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to download resume");
      }

      // ✅ THIS IS THE FIX
      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "resume.pdf";
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };




  const handleSubmitJob = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const url = editingJob
  ? `https://resumewala.co.in/api/jobs/${editingJob._id}`
  : "https://resumewala.co.in/api/jobs";

const method = editingJob ? "PUT" : "POST";

const res = await fetch(url, {
  method,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: formData.title,
    company: formData.company,
    location: formData.location,
    experience: formData.experience,
    description: formData.description,
    requirements: formData.requirements.split(",").map(r => r.trim()),
    salary: formData.salary,
    jobType: formData.jobType,
  }),
});
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to save job");
    }

    toast.success("Job saved successfully");

    setShowJobModal(false);

  } catch (error: any) {
    toast.error(error.message);
  }
};


  const deleteJob = async (_id: string) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this job?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(`https://resumewala.co.in/api/jobs/${_id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to delete job");
    }

    toast.success("Job deleted successfully");
    setShowJobModal(false);
    fetchJobs(); 

  } catch (error: any) {
    toast.error(error.message);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-12 text-white">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-blue-100 mt-2">Manage jobs and candidates</p>
          </div>

          <div className="border-b border-gray-200">
            <div className="flex px-8">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-4 px-6 font-semibold transition-colors border-b-2 flex items-center space-x-2 ${activeTab === 'jobs'
                  ? 'text-blue-500 border-blue-500'
                  : 'text-gray-600 border-transparent hover:text-blue-500'
                  }`}
              >
                <Briefcase className="h-5 w-5" />
                <span>Manage Jobs</span>
              </button>
              <button
                onClick={() => setActiveTab('candidates')}
                className={`py-4 px-6 font-semibold transition-colors border-b-2 flex items-center space-x-2 ${activeTab === 'candidates'
                  ? 'text-blue-500 border-blue-500'
                  : 'text-gray-600 border-transparent hover:text-blue-500'
                  }`}
              >
                <Users className="h-5 w-5" />
                <span>View Candidates</span>
              </button>
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'jobs' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Job Listings</h2>
                  <button
                    onClick={() => openJobModal()}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add New Job</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div
                      key={job._id}
                      className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">{job.title}</h3>
                          <p className="text-blue-500 font-semibold mb-3">{job.company}</p>
                          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Location:</span> {job.location}
                            </div>
                            <div>
                              <span className="font-medium">Experience:</span> {job.experience}
                            </div>
                            <div>
                              <span className="font-medium">Salary:</span> {job.salary}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openJobModal(job)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => deleteJob(job._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'candidates' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Registered Candidates</h2>
                  <p className="text-gray-600">Total: {candidates.length}</p>
                </div>
                {loadingCandidates ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Mobile</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Skills</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Resume</th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidates.map((candidate) => (
                          
                          <tr key={candidate.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-800 font-medium">{candidate.fullName}</td>
                            <td className="px-6 py-4 text-gray-600">{candidate.email}</td>
                            <td className="px-6 py-4 text-gray-600">{candidate.mobile}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {candidate.skills.slice(0, 3).map((skill) => (
                                  <span
                                    key={skill}
                                    className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-medium"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {candidate.skills.length > 3 && (
                                  <span className="text-gray-500 text-xs">+{candidate.skills.length - 3}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button onClick={() => downloadResume(candidate.userId)} className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 font-medium">
                                <Download className="h-4 w-4" />
                                <span>Download</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showJobModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowJobModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingJob ? 'Edit Job' : 'Add New Job'}
              </h2>
              <button
                onClick={() => setShowJobModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitJob} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Senior Frontend Developer"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Tech Solutions Inc."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Mumbai, Maharashtra"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Experience Required</label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 3-5 years"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Salary Range</label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., ₹8-12 LPA"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Job Type</label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Job Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the role and responsibilities..."
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Required Skills (comma-separated)
                </label>
                <input
                  type="text"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., React, TypeScript, Node.js"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  {editingJob ? 'Update Job' : 'Create Job'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
