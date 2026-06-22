import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyJobs, deleteJob, duplicateJob, updateJob } from '../services/employerApi';
import { Plus, Edit2, Trash2, Copy, Users, XCircle, ArrowLeft, Briefcase, Search } from 'lucide-react';

const statusStyles: Record<string, string> = {
  Active: 'bg-green-100 text-green-700 border border-green-200',
  Draft: 'bg-gray-100 text-gray-600 border border-gray-200',
  Closed: 'bg-red-100 text-red-700 border border-red-200',
};

export default function ManageJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchJobs = () => {
    setLoading(true);
    getMyJobs(statusFilter ? { status: statusFilter } : {})
      .then(res => setJobs(res.data.jobs))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, [statusFilter]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setActionLoading(id);
    try { await deleteJob(id); fetchJobs(); }
    catch (e: any) { alert(e.response?.data?.message || 'Failed to delete.'); }
    finally { setActionLoading(null); }
  };

  const handleDuplicate = async (id: string) => {
    setActionLoading(id + '-dup');
    try { await duplicateJob(id); fetchJobs(); }
    catch { alert('Failed to duplicate.'); }
    finally { setActionLoading(null); }
  };

  const handleClose = async (id: string) => {
    if (!confirm('Close this job? Candidates will no longer be able to apply.')) return;
    setActionLoading(id + '-close');
    try { await updateJob(id, { status: 'Closed' }); fetchJobs(); }
    catch { alert('Failed to close job.'); }
    finally { setActionLoading(null); }
  };

  const filtered = jobs.filter(j =>
    j.jobTitle.toLowerCase().includes(filter.toLowerCase()) ||
    j.jobLocation.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/employer/dashboard')} className="p-2 rounded-lg hover:bg-gray-200 transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Manage Jobs</h1>
              <p className="text-sm text-gray-500">{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
            </div>
          </div>
          <Link to="/employer/post-job"
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-semibold text-sm">
            <Plus className="w-4 h-4" /> Post New Job
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search jobs..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          </div>
          <div className="flex gap-2">
            {['', 'Active', 'Draft', 'Closed'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No jobs found</p>
            <Link to="/employer/post-job" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline text-sm">
              <Plus className="w-4 h-4" /> Post your first job
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(job => (
              <div key={job._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{job.jobTitle}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusStyles[job.status]}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                      <span>{job.jobLocation}</span>
                      <span>·</span>
                      <span>{job.employmentType}</span>
                      <span>·</span>
                      <span>{job.workMode}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {job.applicationsCount} applicant{job.applicationsCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {job.keySkills?.slice(0, 4).map((s: string) => (
                        <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full">{s}</span>
                      ))}
                      {job.keySkills?.length > 4 && <span className="text-xs text-gray-400">+{job.keySkills.length - 4} more</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Expires: {new Date(job.jobExpiryDate).toLocaleDateString('en-IN')}
                      {job.postedAt && ` · Posted: ${new Date(job.postedAt).toLocaleDateString('en-IN')}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link to={`/employer/applicants/${job._id}`}
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition">
                      <Users className="w-3.5 h-3.5" /> Applicants
                    </Link>
                    <Link to={`/employer/edit-job/${job._id}`}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDuplicate(job._id)} disabled={actionLoading === job._id + '-dup'}
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Duplicate">
                      <Copy className="w-4 h-4" />
                    </button>
                    {job.status === 'Active' && (
                      <button onClick={() => handleClose(job._id)} disabled={actionLoading === job._id + '-close'}
                        className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition" title="Close Job">
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(job._id, job.jobTitle)} disabled={actionLoading === job._id}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}