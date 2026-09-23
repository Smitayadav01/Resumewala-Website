import { useEffect, useState } from "react";
import { Link,useNavigate} from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import { getMyJobs } from "../../services/employerApi";
import { useEmployer } from "../../context/EmployerContext";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;
const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#ea580c"];

export default function EmployerAnalytics() {
  const navigate = useNavigate();
  const { employer } = useEmployer();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30); // days

  useEffect(() => {
    getMyJobs()
      .then(setJobs)
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Derived Data ──────────────────────────────────────────────

  // Total stats
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.status === "Active").length;
  const totalApplicants = jobs.reduce((s, j) => s + (j.applicantsCount || 0), 0);
  const approvedJobs = jobs.filter(j => j.isAdminApproved).length;

  // Applicants per job (bar chart)
  const applicantsPerJob = jobs
    .filter(j => j.applicantsCount > 0)
    .sort((a, b) => b.applicantsCount - a.applicantsCount)
    .slice(0, 8)
    .map(j => ({
      name: j.title.length > 20 ? j.title.substring(0, 20) + "…" : j.title,
      applicants: j.applicantsCount || 0,
    }));

  // Job status breakdown (pie chart)
  const statusBreakdown = [
    { name: "Active & Live", value: jobs.filter(j => j.status === "Active" && j.isAdminApproved).length },
    { name: "Pending Approval", value: jobs.filter(j => j.status === "Active" && !j.isAdminApproved).length },
    { name: "Draft", value: jobs.filter(j => j.status === "Draft").length },
    { name: "Closed", value: jobs.filter(j => j.status === "Closed").length },
  ].filter(d => d.value > 0);

  // Jobs posted over last N days (line chart)
  const now = new Date();
  const daysAgo = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d;
  };

  const jobsOverTime = Array.from({ length: Math.min(dateRange, 30) }, (_, i) => {
    const day = daysAgo(dateRange - 1 - i);
    const label = day.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const count = jobs.filter(j => {
      const posted = new Date(j.createdAt);
      return (
        posted.getDate() === day.getDate() &&
        posted.getMonth() === day.getMonth() &&
        posted.getFullYear() === day.getFullYear()
      );
    }).length;
    return { date: label, jobs: count };
  });

  // Employment type breakdown
  const typeBreakdown = jobs.reduce((acc: any, j) => {
    const type = j.employmentType || j.jobType || "Other";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.entries(typeBreakdown).map(([name, value]) => ({
    name, value: value as number,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Performance overview for {employer?.companyName}
          </p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-fit"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Jobs Posted", value: totalJobs, icon: "📋", color: "bg-blue-50 border-blue-100", text: "text-blue-700" },
          { label: "Active & Live", value: activeJobs, icon: "✅", color: "bg-green-50 border-green-100", text: "text-green-700" },
          { label: "Total Applicants", value: totalApplicants, icon: "👥", color: "bg-purple-50 border-purple-100", text: "text-purple-700" },
          { label: "Approved Jobs", value: approvedJobs, icon: "🏅", color: "bg-orange-50 border-orange-100", text: "text-orange-700" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} border rounded-xl p-5`}>
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className={`text-2xl font-bold ${stat.text}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Applicants Per Job */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-1">Applicants per Job</h2>
          <p className="text-xs text-gray-400 mb-4">Top jobs by application count</p>
          {applicantsPerJob.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No applicant data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={applicantsPerJob} margin={{ top: 4, right: 8, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  angle={-35}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <Bar dataKey="applicants" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Job Status Pie */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-1">Job Status Breakdown</h2>
          <p className="text-xs text-gray-400 mb-4">Distribution of your job listings</p>
          {statusBreakdown.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No jobs posted yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusBreakdown.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ fontSize: 11, color: "#6b7280" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Jobs Posted Over Time */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-1">Jobs Posted Over Time</h2>
          <p className="text-xs text-gray-400 mb-4">Number of jobs posted per day</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={jobsOverTime} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "#9ca3af" }}
                interval={Math.floor(dateRange / 6)}
              />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Line
                type="monotone"
                dataKey="jobs"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3, fill: "#2563eb" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Employment Type Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-1">Job Types</h2>
          <p className="text-xs text-gray-400 mb-4">Distribution by employment type</p>
          {typeData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={typeData} layout="vertical" margin={{ top: 4, right: 20, left: 20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <Bar dataKey="value" fill="#9333ea" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">All Jobs Performance</h2>
          <Link to="/employer/jobs" className="text-xs text-blue-600 hover:underline">
            Manage Jobs →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Job Title</th>
                <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Approval</th>
                <th className="text-right text-xs font-semibold text-gray-500 pb-3 pr-4">Applicants</th>
                <th className="text-left text-xs font-semibold text-gray-500 pb-3">Posted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    No jobs posted yet.{" "}
                    <Link to="/employer/jobs/new" className="text-blue-600 hover:underline">
                      Post your first job →
                    </Link>
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50 transition">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900 truncate max-w-48">{job.title}</p>
                      <p className="text-xs text-gray-400">{job.location}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        job.status === "Active" ? "bg-green-100 text-green-700" :
                        job.status === "Draft" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {job.status === "Active" ? (
                        job.isAdminApproved ? (
                          <span className="text-xs text-green-600 font-medium">✅ Live</span>
                        ) : (
                          <span className="text-xs text-orange-600 font-medium">⏳ Pending</span>
                        )
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className="font-bold text-gray-900">{job.applicantsCount || 0}</span>
                    </td>
                    <td className="py-3 text-xs text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}