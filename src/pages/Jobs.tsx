import {
  MapPin, Briefcase, Calendar, Search, X,
  CheckCircle, Loader2, ChevronLeft, ChevronRight,
  Building2
} from 'lucide-react';
import { INDUSTRIES } from "../utils/industries";
import { useState, useEffect } from 'react';
import browse from '../assets/browse.png';
import { toast } from "sonner";
import { authFetch } from '../services/apiClient';

const API_URL = import.meta.env.VITE_API_URL;
const JOBS_PER_PAGE = 6;

interface PublicJob {
  _id: string;
  title: string;
  location: string;
  experience?: string;
  industryCategory?: string;
  experienceRequired?: string;
  company?: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType?: string;
  employmentType?: string;
  workMode?: string;
  description: string;
  requirements?: string[];
  keySkills?: string[];
  postedDate?: string;
  createdAt?: string;
  expiryDate?: string;
  isAdminApproved?: boolean;
  applicantsCount?: number;
  employer?: {
    _id: string;
    companyName: string;
    companyLogo?: string;
    companyLocation?: string;
    isVerified?: boolean;
  };
  source?: 'phase1' | 'phase2';
}

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState<PublicJob | null>(null);
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [appliedJobTitle, setAppliedJobTitle] = useState('');
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch Phase 1 + Phase 2 jobs ─────────────────────────────
// const fetchJobs = async () => {
//   setLoading(true);
//   try {
//     const res = await fetch(`${API_URL}/api/jobs/public`);
//     if (!res.ok) throw new Error("Failed to fetch jobs");
//     const data = await res.json();

//     // Mark source based on postedBy so Apply logic still works correctly
//     const jobs = (data.jobs || []).map((j: any) => ({
//       ...j,
//       source: j.postedBy === "employer" ? "phase2" : "phase1",
//     }));

//     setJobs(jobs);
//   } catch (error) {
//     console.error("Fetch error:", error);
//     toast.error("Failed to load jobs");
//   } finally {
//     setLoading(false);
//   }
// };


  const fetchJobs = async () => {
    setLoading(true);
    try {
      const [res1, res2] = await Promise.all([
        fetch(`${API_URL}/api/jobs`),
        fetch(`${API_URL}/api/jobs/public`),
      ]);

      const data1 = await res1.json();
      const data2 = await res2.json();

      const phase1: PublicJob[] = (data1.jobs || []).map((j: any) => ({
        ...j, source: 'phase1',
      }));
      const phase2: PublicJob[] = (data2.jobs || []).map((j: any) => ({
        ...j, source: 'phase2',
      }));

      // Merge — employer jobs first, then admin jobs
      setJobs([...phase2, ...phase1]);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const res = await authFetch('/api/jobs/applied');
      const data = await res.json();
      if (res.ok) setAppliedJobIds(new Set(data.jobIds));
    } catch (err) {
      console.error("Error fetching applied jobs:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchAppliedJobs();
  }, []);

  useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, locationFilter, typeFilter, industryFilter]);
  // ── Helpers ───────────────────────────────────────────────────
  const getCompanyName = (job: PublicJob) =>
    job.employer?.companyName || job.company || 'Company';

  const getCompanyLogo = (job: PublicJob) =>
    job.employer?.companyLogo || null;

  const getExperience = (job: PublicJob) =>
    job.experienceRequired || job.experience || '';

  const getJobType = (job: PublicJob) =>
    job.employmentType || job.jobType || 'Full Time';

  const getSalary = (job: PublicJob) => {
    if (job.salaryMin && job.salaryMax) {
      return `₹${(job.salaryMin / 100000).toFixed(1)}L – ₹${(job.salaryMax / 100000).toFixed(1)}L`;
    }
    return job.salary || '';
  };

  const getSkills = (job: PublicJob) =>
    job.keySkills?.length ? job.keySkills : job.requirements || [];

  const getPostedDate = (job: PublicJob) => {
    const d = job.postedDate || job.createdAt;
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  // ── Filter ────────────────────────────────────────────────────
  const filteredJobs = jobs.filter((job) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      (job.title || '').toLowerCase().includes(q) ||
      getCompanyName(job).toLowerCase().includes(q) ||
      (job.location || '').toLowerCase().includes(q) ||
      getSkills(job).some(s => s.toLowerCase().includes(q));

    const matchLocation =
      !locationFilter ||
      (job.location || '').toLowerCase().includes(locationFilter.toLowerCase());

    const matchType =
  !typeFilter ||
  getJobType(job).toLowerCase().includes(typeFilter.toLowerCase());

const matchIndustry =
  !industryFilter ||
  (job.industryCategory || "") === industryFilter;

return matchSearch && matchLocation && matchType && matchIndustry;
  });

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Apply ─────────────────────────────────────────────────────
  const handleApply = async (job: PublicJob, fromModal = false) => {
    const profileRes = await authFetch('/api/profile');
    if (profileRes.status === 401) {
      toast.error('Please login first');
      return;
    }
    if (appliedJobIds.has(job._id)) return;
    if (applyingJobId === job._id) return;

    setApplyingJobId(job._id);
    try {
      const profileData = await profileRes.json();
      if (!profileRes.ok) throw new Error('Could not load profile');

      let res;

      if (job.source === 'phase2') {
        // Employer-posted job — JSON apply
        res = await authFetch(`/api/jobs/${job._id}/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateName: profileData.personal?.fullName || '',
            candidateEmail: profileData.personal?.email || '',
            candidatePhone: profileData.personal?.mobileNumbers || '',
            experience: profileData.experience?.length > 0
              ? `${profileData.experience[0].jobTitle || ''} at ${profileData.experience[0].company || ''}`
              : '',
            education: profileData.education?.length > 0
              ? `${profileData.education[0].degree || ''} — ${profileData.education[0].institution || ''}`
              : '',
            location: profileData.personal?.location || '',
            keySkills: profileData.skills || [],
            resumeUrl: profileData.resume?.url || '',
          }),
        });
      } else {
        // Phase 1 admin job — FormData apply
        const formData = new FormData();
        formData.append('jobId', job._id);
        formData.append('personalInfo', JSON.stringify(profileData.personal || {}));
        formData.append('experiences', JSON.stringify(profileData.experience || []));
        formData.append('education', JSON.stringify(profileData.education || []));
        formData.append('skills', JSON.stringify(profileData.skills || []));
        res = await authFetch('/api/jobs/apply', { method: 'POST', body: formData });
      }

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Failed to apply');

      setAppliedJobIds(prev => new Set(prev).add(job._id));
      if (fromModal) {
        setAppliedJobTitle(job.title);
        setSelectedJob(null);
        setShowSuccessModal(true);
      } else {
        toast.success(`Applied successfully for ${job.title}!`);
      }
    } catch (err: any) {
      console.error("Apply error:", err);
      toast.error(err.message || 'Something went wrong');
    } finally {
      setApplyingJobId(null);
    }
  };

  // ── Apply Button ──────────────────────────────────────────────
  const ApplyButton = ({
    job, fromModal = false, extraClass = '',
  }: { job: PublicJob; fromModal?: boolean; extraClass?: string }) => {
    const alreadyApplied = appliedJobIds.has(job._id);
    const isApplying = applyingJobId === job._id;
    return (
      <button
        onClick={(e) => { e.stopPropagation(); handleApply(job, fromModal); }}
        disabled={alreadyApplied || isApplying}
        className={`flex items-center justify-center gap-2 font-semibold rounded-lg transition-all ${extraClass} ${
          alreadyApplied
            ? 'bg-green-50 text-green-700 border border-green-200 cursor-not-allowed'
            : isApplying
            ? 'bg-blue-400 text-white cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
        }`}
      >
        {alreadyApplied ? <><CheckCircle size={16} /> Applied</>
          : isApplying ? <><Loader2 size={16} className="animate-spin" /> Applying...</>
          : 'Apply Now'}
      </button>
    );
  };

  // ── Pagination ────────────────────────────────────────────────
  const Pagination = () => {
    if (totalPages <= 1) return null;
    const getPageNumbers = () => {
      const pages: (number | '...')[] = [];
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        if (currentPage > 3) pages.push('...');
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (currentPage < totalPages - 2) pages.push('...');
        pages.push(totalPages);
      }
      return pages;
    };
    return (
      <div className="flex items-center justify-center gap-1 mt-12">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`e-${idx}`} className="px-3 py-2 text-gray-400 text-sm">...</span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page as number)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                currentPage === page
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ─────────────────────────────────────────────── */}
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

              {/* Main Search */}
              <div className="bg-white rounded-xl shadow-lg p-2 flex items-center gap-2 max-w-xl mb-3">
                <Search className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, company, skill or location"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-2 py-3 text-gray-800 outline-none text-sm sm:text-base"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600 mr-1">
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition">
                  Search
                </button>
              </div>

              {/* Quick Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {['Full Time', 'Part Time', 'Remote', 'Contract'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(typeFilter === type ? '' : type)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      typeFilter === type
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden md:flex justify-center">
              <img
                src={browse}
                alt="Browse Jobs"
                className="max-h-64 lg:max-h-72 w-auto object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ───────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Location */}
            <div className="relative">
              <MapPin className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="City or state"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
              />
            </div>

            {/* Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
              <option value="Internship">Internship</option>
            </select>

            {/* Industry */}
<select
  value={industryFilter}
  onChange={(e) => setIndustryFilter(e.target.value)}
  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
>
  <option value="">All Industries</option>

  {INDUSTRIES.map((industry) => (
    <option key={industry} value={industry}>
      {industry}
    </option>
  ))}
</select>

            {/* Clear */}
           {(locationFilter || typeFilter || searchTerm || industryFilter) && (
  <button
    onClick={() => {
      setLocationFilter('');
      setTypeFilter('');
      setSearchTerm('');
      setIndustryFilter('');
    }}
    className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1.5 rounded-lg hover:bg-red-50 transition"
  >
    ✕ Clear all
  </button>
)}
            <span className="ml-auto text-sm text-gray-500">
              <span className="font-semibold text-gray-800">{filteredJobs.length}</span> jobs found
            </span>
          </div>
        </div>
      </div>

      {/* ── JOB LIST ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl h-52 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : (
          <>
            {/* Count + Page info */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600 text-sm">
                Showing{' '}
                <span className="font-semibold text-gray-800">
                  {filteredJobs.length === 0 ? 0 : (currentPage - 1) * JOBS_PER_PAGE + 1}–{Math.min(currentPage * JOBS_PER_PAGE, filteredJobs.length)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-gray-800">{filteredJobs.length}</span> jobs
              </p>
              {totalPages > 1 && (
                <p className="text-gray-400 text-sm">Page {currentPage} of {totalPages}</p>
              )}
            </div>

            {filteredJobs.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-500 text-lg font-medium">No jobs match your search</p>
                <p className="text-gray-400 text-sm mt-2">Try different keywords or clear your filters</p>
                <button
  onClick={() => {
    setSearchTerm('');
    setLocationFilter('');
    setTypeFilter('');
    setIndustryFilter('');
  }}
  className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
>
  Clear Filters
</button>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedJobs.map((job) => (
                    <div
                      key={`${job.source}-${job._id}`}
                      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 cursor-pointer group relative overflow-hidden"
                      onClick={() => setSelectedJob(job)}
                    >
                      {/* Verified stripe */}
                      {job.source === 'phase2' && job.employer?.isVerified && (
                        <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2.5 py-1 rounded-bl-lg font-medium">
                          ✓ Verified
                        </div>
                      )}

                      {/* Company + Title */}
                      <div className="flex items-start gap-3 mb-4">
                        {getCompanyLogo(job) ? (
                          <img
                            src={getCompanyLogo(job)!}
                            alt={getCompanyName(job)}
                            className="w-11 h-11 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-blue-700 font-bold text-base flex-shrink-0">
                            {getCompanyName(job)[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition leading-tight truncate">
                            {job.title}
                          </h2>
                          <p className="text-blue-600 font-medium text-sm mt-0.5 flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {getCompanyName(job)}
                          </p>
                        </div>
                        <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 whitespace-nowrap">
                          {getJobType(job)}
                        </span>
                      </div>

                      {/* Job Meta */}
                      <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{job.location}</span>
                          {job.workMode && job.workMode !== job.location && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs flex-shrink-0">
                              {job.workMode}
                            </span>
                          )}
                        </div>

                         {/* Industry */}
  {job.industryCategory && (
    <div className="flex items-center gap-2">
      <span className="text-gray-400 flex-shrink-0">🏭</span>
      <span>{job.industryCategory}</span>
    </div>
  )}


                        {getExperience(job) && (
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span>{getExperience(job)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span>{getPostedDate(job)}</span>
                        </div>
                      </div>

                      {/* Salary */}
                      {getSalary(job) && (
                        <p className="text-base font-bold text-gray-900 mb-3">{getSalary(job)}</p>
                      )}

                      {/* Skills */}
                      {getSkills(job).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {getSkills(job).slice(0, 3).map((skill, i) => (
                            <span key={i} className="bg-gray-50 text-gray-600 px-2.5 py-0.5 rounded-full text-xs border border-gray-200">
                              {skill}
                            </span>
                          ))}
                          {getSkills(job).length > 3 && (
                            <span className="text-gray-400 text-xs py-0.5">
                              +{getSkills(job).length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      <ApplyButton job={job} fromModal={false} extraClass="w-full py-2.5 text-sm" />
                    </div>
                  ))}
                </div>

                <Pagination />
              </>
            )}
          </>
        )}
      </div>

      {/* ── JOB DETAIL MODAL ─────────────────────────────────── */}
      {selectedJob && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {getCompanyLogo(selectedJob) ? (
                    <img
                      src={getCompanyLogo(selectedJob)!}
                      alt={getCompanyName(selectedJob)}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-blue-700 font-bold text-xl flex-shrink-0">
                      {getCompanyName(selectedJob)[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedJob.title}</h2>
                    <p className="text-blue-600 font-semibold mt-0.5 flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      {getCompanyName(selectedJob)}
                      {selectedJob.employer?.isVerified && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                          ✓ Verified
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-3">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Meta Pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { icon: <MapPin className="h-3.5 w-3.5" />, text: selectedJob.location },
                  { icon: <Briefcase className="h-3.5 w-3.5" />, text: getExperience(selectedJob) },
                  { icon: null, text: getJobType(selectedJob) },
                  { icon: null, text: selectedJob.workMode },
                ].filter(m => m.text).map((m, i) => (
                  <span key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-sm">
                    {m.icon} {m.text}
                  </span>
                ))}
              </div>

              {/* Salary */}
              {getSalary(selectedJob) && (
                <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-xl font-bold text-gray-900">{getSalary(selectedJob)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Annual salary range</p>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Job Description</h3>
                <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                  {selectedJob.description}
                </p>
              </div>

              {/* Skills */}
              {getSkills(selectedJob).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {getSkills(selectedJob).map((skill, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Expiry */}
              {selectedJob.expiryDate && (
                <p className="text-xs text-gray-400 mb-2">
                  Applications close: {new Date(selectedJob.expiryDate).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-white rounded-b-2xl">
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

      {/* ── SUCCESS MODAL ────────────────────────────────────── */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl text-center shadow-2xl max-w-sm w-full">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-500" size={36} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Application Sent!</h3>
            <p className="text-gray-600 mb-6">
              You've successfully applied for{' '}
              <span className="font-semibold text-gray-800">{appliedJobTitle}</span>.
              <br />
              <span className="text-sm text-gray-400 mt-1 block">The employer will review your profile and get back to you.</span>
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