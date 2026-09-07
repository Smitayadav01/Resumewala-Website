import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../../services/employerApi";
import { useEmployer } from "../../context/EmployerContext";
import toast from "react-hot-toast";
import logo from "../../assets/logo.webp";

// Add creditInfo to Stats interface
interface Stats {
  totalActiveJobs: number;
  totalApplications: number;
  recentApplications: any[];
  jobsWithCounts: any[];
  creditInfo?: {
    totalPosted: number;
    freeLimit: number;
    freeRemaining: number;
    hasPaidPlan: boolean;
    paidCredits: number | string;
    plan: string;
  };
}


const StatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white text-xl`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

export default function EmployerDashboard() {
  const { employer, refreshEmployer } = useEmployer();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    refreshEmployer();
    getDashboardStats()
      .then((data) => setStats(data))
      .catch(() => toast.error("Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const sub = employer?.subscription;
  const hasPlan = sub?.plan && sub.plan !== "none";
  const creditsLeft = sub?.plan === "premium" ? "Unlimited" : sub?.jobCredits ?? 0;
  const subExpiry = sub?.expiresAt
    ? new Date(sub.expiresAt).toLocaleDateString("en-IN")
    : "—";

  const profileComplete = [
    employer?.companyLogo,
    (employer as any)?.companyDescription,
  ].filter(Boolean).length;
  const profilePct = Math.round((profileComplete / 2) * 100);

  const quickActions = [
    { label: "Post New Job", to: "/employer/jobs/new", icon: "➕", color: "bg-blue-600" },
    { label: "Manage Jobs", to: "/employer/jobs", icon: "📋", color: "bg-indigo-500" },
    { label: "View Applicants", to: "/employer/applicants", icon: "👥", color: "bg-green-500" },
    { label: "Edit Company Profile", to: "/employer/profile", icon: "🏢", color: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* ✅ Use logo.webp */}
            <img
              src={logo}
              alt="Resumewala"
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {employer?.companyName}
                {employer?.isVerified && (
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-500">Welcome back, {employer?.recruiterName}</p>
            </div>
          </div>
          <Link
            to="/employer/jobs/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition"
          >
            + Post New Job
          </Link>
        </div>

        {/* Subscription Banner */}
        {/* <div className={`mb-6 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${
          !hasPlan ? "bg-amber-50 border border-amber-200" : "bg-green-50 border border-green-200"
        }`}>
          <div>
            <p className={`font-semibold text-sm ${!hasPlan ? "text-amber-800" : "text-green-800"}`}>
              {!hasPlan ? "⚠️ No active plan" : `✅ ${sub?.plan?.toUpperCase()} Plan Active`}
            </p>
            <p className={`text-xs mt-0.5 ${!hasPlan ? "text-amber-600" : "text-green-600"}`}>
              {!hasPlan
                ? "Purchase a plan to unlock full applicant details (email, phone, resume)."
                : `Job Credits: ${creditsLeft} · Expires: ${subExpiry}`}
            </p>
          </div>
          <Link
            to="/employer/plans"
            className={`text-xs font-semibold px-4 py-2 rounded-lg ${
              !hasPlan
                ? "bg-amber-600 text-white hover:bg-amber-700"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {!hasPlan ? "Choose Plan" : "Upgrade Plan"}
          </Link>
        </div> */}

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Active Jobs"
              value={stats?.totalActiveJobs ?? 0}
              icon="📌" color="bg-blue-500"
            />
            <StatCard
              label="Total Applications"
              value={stats?.totalApplications ?? 0}
              icon="📄" color="bg-green-500"
            />
            <StatCard
              label="Profile Complete"
              value={`${profilePct}%`}
              icon="📊" color="bg-purple-500"
            />
          </div>
        )}

{/* // Add this component inside EmployerDashboard, after stats cards: */}
{/* Credit Info Banner */}
{stats?.creditInfo && (
  <div className={`mb-6 rounded-xl p-4 border ${
    stats.creditInfo.freeRemaining > 0
      ? "bg-blue-50 border-blue-200"
      : stats.creditInfo.hasPaidPlan
      ? "bg-green-50 border-green-200"
      : "bg-red-50 border-red-200"
  }`}>
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <p className={`font-semibold text-sm ${
          stats.creditInfo.freeRemaining > 0 ? "text-blue-800"
          : stats.creditInfo.hasPaidPlan ? "text-green-800"
          : "text-red-800"
        }`}>
          {stats.creditInfo.freeRemaining > 0
            ? `🆓 ${stats.creditInfo.freeRemaining} free job post${stats.creditInfo.freeRemaining !== 1 ? "s" : ""} remaining`
            : stats.creditInfo.hasPaidPlan
            ? `💳 ${stats.creditInfo.plan.toUpperCase()} Plan — ${stats.creditInfo.paidCredits === "Unlimited" ? "Unlimited" : `${stats.creditInfo.paidCredits} credits`} remaining`
            : "⚠️ No job posts remaining"}
        </p>
        <p className={`text-xs mt-0.5 ${
          stats.creditInfo.freeRemaining > 0 ? "text-blue-600"
          : stats.creditInfo.hasPaidPlan ? "text-green-600"
          : "text-red-600"
        }`}>
          {stats.creditInfo.freeRemaining > 0
            ? `${stats.creditInfo.totalPosted} of ${stats.creditInfo.freeLimit} free posts used`
            : stats.creditInfo.hasPaidPlan
            ? "Purchase more credits when needed"
            : "You've used all 2 free posts. Purchase a plan to continue posting."}
        </p>
      </div>
      {!stats.creditInfo.hasPaidPlan && (
        <Link
          to="/employer/plans"
          className="text-xs font-semibold px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
        >
          {stats.creditInfo.freeRemaining > 0 ? "View Plans" : "Buy Plan →"}
        </Link>
      )}
    </div>

    {/* Progress bar for free posts */}
    {stats.creditInfo.freeRemaining >= 0 && !stats.creditInfo.hasPaidPlan && (
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Free posts used</span>
          <span>{Math.min(stats.creditInfo.totalPosted, stats.creditInfo.freeLimit)}/{stats.creditInfo.freeLimit}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              stats.creditInfo.freeRemaining === 0 ? "bg-red-500" : "bg-blue-500"
            }`}
            style={{
              width: `${Math.min(100, (Math.min(stats.creditInfo.totalPosted, stats.creditInfo.freeLimit) / stats.creditInfo.freeLimit) * 100)}%`
            }}
          />
        </div>
      </div>
    )}
  </div>
)}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((a) => (
            <Link
              key={a.to} to={a.to}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md p-5 text-center transition group"
            >
              <div className={`w-10 h-10 ${a.color} rounded-lg flex items-center justify-center text-white text-lg mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                {a.icon}
              </div>
              <p className="text-sm font-semibold text-gray-700">{a.label}</p>
            </Link>
          ))}
        </div>

        {/* ✅ Per-job applicant counts */}
        {stats?.jobsWithCounts && stats.jobsWithCounts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4">Applicants per Job</h2>
            <div className="space-y-3">
              {stats.jobsWithCounts.map((job: any) => (
                <div key={job._id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{job.title}</p>
                    <div className="flex gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        job.status === "Active" ? "bg-green-100 text-green-700" :
                        job.status === "Draft" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{job.status}</span>
                      {job.status === "Active" && !job.isAdminApproved && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-700">
                          ⏳ Pending Approval
                        </span>
                      )}
                      {job.status === "Active" && job.isAdminApproved && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                          ✅ Live
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900">
                      {job.applicantsCount || 0} applicants
                    </span>
                    <Link
                      to={`/employer/applicants/${job._id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Applications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Applications</h2>
          {stats?.recentApplications?.length ? (
            <div className="space-y-3">
              {stats.recentApplications.map((app: any) => (
                <div key={app._id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {app.candidateName || "Candidate"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Applied for: {app.job?.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      app.status === "Shortlisted" ? "bg-green-100 text-green-700" :
                      app.status === "Rejected" ? "bg-red-100 text-red-700" :
                      app.status === "Contacted" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{app.status}</span>
                    <Link
                      to={`/employer/applicants/${app.job?._id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">
              No applications yet. Post a job to get started!
            </p>
          )}
        </div>

      </div>
    </div>
  );
}