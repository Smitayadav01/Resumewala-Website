import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getApplicants,
  getAllApplicants,
  updateApplicationStatus,
} from "../../services/employerApi";
import toast from "react-hot-toast";
import { X, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_OPTIONS = ["Applied", "Shortlisted", "Contacted", "Rejected"];
const STATUS_COLORS: Record<string, string> = {
  Applied: "bg-gray-100 text-gray-700",
  Shortlisted: "bg-green-100 text-green-700",
  Contacted: "bg-blue-100 text-blue-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function ApplicantPanel() {
  const { jobId } = useParams();
  const isAllView = !jobId;

  const [applicants, setApplicants] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [jobTitle, setJobTitle] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [resumeModal, setResumeModal] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  // ── Fetch applicants ────────────────────────────────────────
  const fetchApplicants = async () => {
    setLoading(true);
    try {
      let data;
      if (isAllView) {
        data = await getAllApplicants({ sortBy, search });
      } else {
        data = await getApplicants(jobId!, { sortBy });
      }
      const list = data.applicants || [];
      setApplicants(list);
      setFiltered(list);
      setTotal(data.total || list.length);
      setJobTitle(data.jobTitle || "");
    } catch (err: any) {
      console.error("ApplicantPanel fetch error:", err);
      toast.error("Failed to load applicants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId, sortBy]);

  // Client-side search for per-job view
  useEffect(() => {
    if (isAllView) return;
    if (!search.trim()) {
      setFiltered(applicants);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      applicants.filter(
        (a) =>
          a.candidateName?.toLowerCase().includes(q) ||
          a.location?.toLowerCase().includes(q) ||
          a.education?.toLowerCase().includes(q) ||
          a.experience?.toLowerCase().includes(q) ||
          a.jobTitle?.toLowerCase().includes(q) ||
          a.keySkills?.some((s: string) => s.toLowerCase().includes(q))
      )
    );
  }, [search, applicants]);

  // ── View Resume ─────────────────────────────────────────────
  const handleViewResume = async (resumeUrl: string, candidateName: string) => {
    if (!resumeUrl || resumeUrl.trim() === "") {
      toast.error("No resume available.");
      return;
    }

    setResumeLoading(true);

    try {
      // Build the full URL
      let fullUrl = resumeUrl;
      if (!resumeUrl.startsWith("http")) {
        fullUrl = `${API_URL}${resumeUrl.startsWith("/") ? "" : "/"}${resumeUrl}`;
      }

      console.log("Fetching resume from:", fullUrl);

      const res = await fetch(fullUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();
      console.log("Blob type:", blob.type, "size:", blob.size);

      if (blob.size === 0) {
        throw new Error("Empty file received");
      }

      // Force PDF mime type so browser renders inline instead of downloading
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(pdfBlob);

      setResumeModal({ url: blobUrl, name: candidateName });
    } catch (err: any) {
      console.error("Resume load error:", err);
      toast.error("Could not load resume: " + err.message);
    } finally {
      setResumeLoading(false);
    }
  };

  const closeResumeModal = () => {
    if (resumeModal?.url.startsWith("blob:")) {
      URL.revokeObjectURL(resumeModal.url);
    }
    setResumeModal(null);
  };

  // ── Status change ───────────────────────────────────────────
  const handleStatusChange = async (
    appId: string,
    status: string,
    source: string
  ) => {
    if (source === "phase1") {
      toast("Status tracking is only available for direct employer job applications.", {
        icon: "ℹ️",
      });
      return;
    }
    setUpdating(appId);
    try {
      await updateApplicationStatus(appId, status);
      const update = (list: any[]) =>
        list.map((a) => (a._id === appId ? { ...a, status } : a));
      setApplicants((p) => update(p));
      setFiltered((p) => update(p));
      toast.success(`Marked as ${status}`);
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isAllView
              ? "All Applicants"
              : jobTitle
              ? `Applicants — ${jobTitle}`
              : "Applicants"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} candidate{total !== 1 ? "s" : ""} applied
            {isAllView && " across all your jobs"}
          </p>
        </div>
        <Link
          to="/employer/jobs"
          className="text-sm text-gray-500 hover:text-gray-800 w-fit"
        >
          ← Back to Jobs
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder={
            isAllView
              ? "Search by name, job title, skill, location..."
              : "Search by name, skill, location, education..."
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && isAllView) fetchApplicants();
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-52"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        <button
          onClick={fetchApplicants}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Refresh
        </button>
        <span className="text-xs text-gray-400 ml-auto">
          {filtered.length} of {total}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl h-36 animate-pulse border border-gray-100"
            />
          ))}
        </div>
      ) : total === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-gray-600 font-semibold text-lg">No applicants yet</p>
          <p className="text-sm text-gray-400 mt-2">
            {isAllView
              ? "Candidates will appear here once they apply to your jobs."
              : "Once candidates apply for this job, they will appear here."}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500">No applicants match your search.</p>
          <button
            onClick={() => {
              setSearch("");
              setFiltered(applicants);
            }}
            className="mt-3 text-sm text-blue-600 hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                {/* Left: Candidate Info */}
                <div className="flex-1 min-w-0">

                  {/* Name + Status */}
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                      {(app.candidateName || "C")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base">
                        {app.candidateName}
                      </h3>
                      {app.candidateEmail && (
                        <p className="text-xs text-gray-500">{app.candidateEmail}</p>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ml-auto md:ml-0 ${
                        STATUS_COLORS[app.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  {/* Job title — only in all-view */}
                  {isAllView && app.jobTitle && (
                    <p className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1">
                      📋 {app.jobTitle}
                    </p>
                  )}

                  {/* Details grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-600 mb-3">
                    {app.experience && (
                      <div className="flex items-start gap-1.5">
                        <span className="flex-shrink-0">💼</span>
                        <span className="line-clamp-1">{app.experience}</span>
                      </div>
                    )}
                    {app.education && (
                      <div className="flex items-start gap-1.5">
                        <span className="flex-shrink-0">🎓</span>
                        <span className="line-clamp-1">{app.education}</span>
                      </div>
                    )}
                    {app.location && (
                      <div className="flex items-start gap-1.5">
                        <span className="flex-shrink-0">📍</span>
                        <span>{app.location}</span>
                      </div>
                    )}
                    {app.candidatePhone && (
                      <div className="flex items-start gap-1.5">
                        <span className="flex-shrink-0">📞</span>
                        <span>{app.candidatePhone}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-1.5 text-gray-400">
                      <span className="flex-shrink-0">📅</span>
                      <span>
                        {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  {app.keySkills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {app.keySkills.slice(0, 6).map((s: string, i: number) => (
                        <span
                          key={i}
                          className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-md font-medium"
                        >
                          {s}
                        </span>
                      ))}
                      {app.keySkills.length > 6 && (
                        <span className="text-xs text-gray-400">
                          +{app.keySkills.length - 6} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0 md:items-end">

                  {/* View Resume */}
                  {app.resumeUrl && app.resumeUrl.trim() !== "" ? (
                    <button
                      onClick={() =>
                        handleViewResume(app.resumeUrl, app.candidateName)
                      }
                      disabled={resumeLoading}
                      className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 font-medium whitespace-nowrap disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {resumeLoading ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>📄 View Resume</>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 px-3 py-1.5 whitespace-nowrap">
                      No resume uploaded
                    </span>
                  )}

                  {/* Status buttons — phase2 only */}
                  {app.source === "phase2" && (
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {STATUS_OPTIONS.filter((s) => s !== app.status).map((s) => (
                        <button
                          key={s}
                          disabled={updating === app._id}
                          onClick={() =>
                            handleStatusChange(app._id, s, app.source)
                          }
                          className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition disabled:opacity-50 whitespace-nowrap ${
                            s === "Shortlisted"
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              : s === "Rejected"
                              ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              : s === "Contacted"
                              ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {s === "Shortlisted"
                            ? "✅ Shortlist"
                            : s === "Rejected"
                            ? "❌ Reject"
                            : s === "Contacted"
                            ? "📞 Contacted"
                            : "↩️ Reset"}
                        </button>
                      ))}
                    </div>
                  )}

                  {app.source === "phase1" && (
                    <span className="text-xs text-gray-400 italic">
                      Via job portal
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Resume Viewer Modal — embed instead of iframe */}
      {resumeModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeResumeModal}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl flex flex-col shadow-2xl"
            style={{ height: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="font-semibold text-gray-900">
                  {resumeModal.name}'s Resume
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">View only</p>
              </div>
              <button
                onClick={closeResumeModal}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ✅ embed tag — forces inline PDF rendering, no download prompt */}
            <div className="flex-1 overflow-hidden rounded-b-2xl bg-gray-100">
              <embed
                src={resumeModal.url}
                type="application/pdf"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}