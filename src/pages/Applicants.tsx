import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobApplicants, getAllApplications, updateApplicationStatus } from '../services/employerApi';
import { ArrowLeft, Download, User, MapPin, Briefcase, Calendar, Filter, ChevronDown } from 'lucide-react';

const statusOptions = ['Applied', 'Shortlisted', 'Contacted', 'Rejected'];
const statusStyles: Record<string, string> = {
  Applied: 'bg-blue-100 text-blue-700',
  Shortlisted: 'bg-green-100 text-green-700',
  Contacted: 'bg-purple-100 text-purple-700',
  Rejected: 'bg-red-100 text-red-700',
};

export default function Applicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchApplicants = () => {
    setLoading(true);
    const params: any = {};
    if (statusFilter) params.status = statusFilter;

    const request = jobId
      ? getJobApplicants(jobId, params)
      : getAllApplications(params);

    request.then(res => setApplications(res.data.applications))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApplicants(); }, [jobId, statusFilter]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setUpdatingId(appId);
    try {
      await updateApplicationStatus(appId, newStatus);
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
    } catch { alert('Failed to update status.'); }
    finally { setUpdatingId(null); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-200 transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {jobId ? 'Job Applicants' : 'All Applications'}
              </h1>
              <p className="text-sm text-gray-500">{applications.length} application{applications.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {['', ...statusOptions].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No applications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map(app => (
              <div key={app._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition">
                {/* Main Row */}
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* Candidate Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 font-bold text-sm">{app.candidateName?.[0]?.toUpperCase() || 'C'}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{app.candidateName}</h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                          {app.candidateLocation && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" /> {app.candidateLocation}
                            </span>
                          )}
                          {app.candidateExperience && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Briefcase className="w-3 h-3" /> {app.candidateExperience}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" /> {new Date(app.appliedAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        {app.job?.jobTitle && (
                          <p className="text-xs text-blue-600 mt-1">Applied for: {app.job.jobTitle}</p>
                        )}
                        {app.candidateSkills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {app.candidateSkills.slice(0, 5).map((s: string) => (
                              <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
                            ))}
                            {app.candidateSkills.length > 5 && <span className="text-xs text-gray-400">+{app.candidateSkills.length - 5}</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Status Dropdown */}
                      <div className="relative">
                        <select
                          value={app.status}
                          disabled={updatingId === app._id}
                          onChange={e => handleStatusChange(app._id, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 pr-7 appearance-none ${statusStyles[app.status]}`}
                        >
                          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                      </div>

                      {/* Resume Download */}
                      {app.resumeUrl && (
                        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition">
                          <Download className="w-3.5 h-3.5" /> Resume
                        </a>
                      )}

                      {/* Expand */}
                      <button onClick={() => setExpandedId(expandedId === app._id ? null : app._id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === app._id ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded - Contact Info */}
                {expandedId === app._id && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs font-medium mb-1">EMAIL</p>
                        <a href={`mailto:${app.candidateEmail}`} className="text-blue-600 hover:underline">{app.candidateEmail}</a>
                      </div>
                      {app.candidatePhone && (
                        <div>
                          <p className="text-gray-500 text-xs font-medium mb-1">PHONE</p>
                          <a href={`tel:${app.candidatePhone}`} className="text-gray-900">{app.candidatePhone}</a>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-500 text-xs font-medium mb-1">APPLIED ON</p>
                        <p className="text-gray-900">{new Date(app.appliedAt).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    {app.notes && (
                      <div className="mt-3">
                        <p className="text-gray-500 text-xs font-medium mb-1">NOTES</p>
                        <p className="text-gray-700 text-sm">{app.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}