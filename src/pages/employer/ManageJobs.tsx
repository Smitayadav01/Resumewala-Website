import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyJobs, deleteJob, duplicateJob, updateJob } from "../../services/employerApi";
import toast from "react-hot-toast";

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  approved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  Draft: "bg-gray-100 text-gray-600",
  rejected: "bg-red-100 text-red-700",
  Closed: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  Active: "Active",
  approved: "✅ Approved & Live",
  pending: "⏳ Pending Approval",
  Draft: "Draft",
  rejected: "❌ Rejected",
  Closed: "Closed",
};

export default function ManageJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [creditInfo, setCreditInfo] = useState<any>(null);

const fetchJobs = () => {
  getMyJobs()
    .then((data) => {
      // Handle both old array response and new object response
      if (Array.isArray(data)) {
        setJobs(data);
      } else {
        setJobs(data.jobs || []);
        setCreditInfo(data.creditInfo || null);
      }
    })
    .catch(() => toast.error("Failed to load jobs."))
    .finally(() => setLoading(false));
};

// Add credit banner at top of ManageJobs return, before filter tabs:
{creditInfo && (
  <div className={`mb-4 rounded-xl p-3 border text-sm flex items-center justify-between gap-3 ${
    creditInfo.freeRemaining > 0
      ? "bg-blue-50 border-blue-200 text-blue-800"
      : creditInfo.hasPaidPlan
      ? "bg-green-50 border-green-200 text-green-800"
      : "bg-red-50 border-red-200 text-red-800"
  }`}>
    <span className="font-medium">
      {creditInfo.freeRemaining > 0
        ? `🆓 ${creditInfo.freeRemaining} free post${creditInfo.freeRemaining !== 1 ? "s" : ""} remaining`
        : creditInfo.hasPaidPlan
        ? `💳 ${creditInfo.paidCredits === "Unlimited" ? "Unlimited" : creditInfo.paidCredits} paid credits remaining`
        : "⚠️ No credits remaining — purchase a plan"}
    </span>
    {!creditInfo.hasPaidPlan && creditInfo.freeRemaining === 0 && (
      <Link to="/employer/plans" className="text-xs font-semibold px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Buy Plan
      </Link>
    )}
  </div>
)}

  useEffect(() => { fetchJobs(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteJob(id);
      toast.success("Job deleted.");
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch {
      toast.error("Failed to delete job.");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const { job } = await duplicateJob(id);
      toast.success("Job duplicated. Awaiting admin approval.");
      setJobs((prev) => [job, ...prev]);
    } catch {
      toast.error("Failed to duplicate job.");
    }
  };

  const handleClose = async (id: string) => {
    try {
      await updateJob(id, { status: "Closed" });
      toast.success("Job closed.");
      setJobs((prev) => prev.map((j) => j._id === id ? { ...j, status: "Closed" } : j));
    } catch {
      toast.error("Failed to close job.");
    }
  };

  // Filter tabs — map to correct status values
  const filterMap: Record<string, string[]> = {
    All: [],
    Live: ["approved", "Active"],
    Pending: ["pending"],
    Draft: ["Draft"],
    Rejected: ["rejected"],
    Closed: ["Closed"],
  };

  const filtered = filter === "All"
    ? jobs
    : jobs.filter((j) => filterMap[filter]?.includes(j.status));

  const getCount = (tab: string) =>
    tab === "All" ? jobs.length : jobs.filter((j) => filterMap[tab]?.includes(j.status)).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manage Jobs</h1>
          <p className="text-sm text-gray-500">{jobs.length} total jobs</p>
        </div>
        <Link
          to="/employer/jobs/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition w-fit"
        >
          + Post New Job
        </Link>
      </div>

      {/* Info banner */}
      {/* <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
        ℹ️ Jobs submitted by you require admin approval before appearing on the Browse Jobs page.
        You will receive an email once your job is approved.
      </div> */}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["All", "Live", "Pending", "Draft", "Rejected", "Closed"].map((tab) => (
          <button
            key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filter === tab ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab}
            <span className="ml-1.5 text-xs opacity-70">({getCount(tab)})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl h-24 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 mb-3">No {filter !== "All" ? filter.toLowerCase() : ""} jobs found.</p>
          <Link to="/employer/jobs/new" className="text-blue-600 text-sm font-medium hover:underline">
            Post your first job →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((job) => (
            <div key={job._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[job.status] || "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABELS[job.status] || job.status}
                    </span>
                  </div>

                  {/* Rejection reason */}
                  {job.status === "rejected" && job.rejectionReason && (
                    <p className="text-xs text-red-600 mb-1">
                      Reason: {job.rejectionReason}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    {job.location && <span>📍 {job.location}</span>}
                    {job.industryCategory && <span>🏭 {job.industryCategory}</span>}
                    {job.employmentType && <span>⏱ {job.employmentType}</span>}
                    {job.workMode && <span>💼 {job.workMode}</span>}
                    <span>👥 {job.applicantsCount || 0} applicants</span>
                    {job.expiryDate && (
                      <span>📅 Expires {new Date(job.expiryDate).toLocaleDateString("en-IN")}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(job.status === "approved" || job.status === "Active") && (
                    <Link
                      to={`/employer/applicants/${job._id}`}
                      className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 font-medium"
                    >
                      👥 Applicants
                    </Link>
                  )}
                  <Link
                    to={`/employer/jobs/edit/${job._id}`}
                    className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 font-medium"
                  >
                    ✏️ Edit
                  </Link>
                  <button onClick={() => handleDuplicate(job._id)}
                    className="text-xs px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 font-medium">
                    📋 Duplicate
                  </button>
                  {(job.status === "approved" || job.status === "Active") && (
                    <button onClick={() => handleClose(job._id)}
                      className="text-xs px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 font-medium">
                      🔒 Close
                    </button>
                  )}
                  <button onClick={() => handleDelete(job._id, job.title)}
                    className="text-xs px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 font-medium">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}