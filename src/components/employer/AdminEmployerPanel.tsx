/**
 * ADMIN EMPLOYER PANEL — Add this as a tab/section inside your existing Admin.tsx
 *
 * Import and use the functions below from your adminApi or employerApi:
 *   getAllEmployers, approveEmployer, blockEmployer, verifyEmployer, getAllPayments
 *
 * API endpoints (already built in backend):
 *   GET    /api/admin/employers
 *   PATCH  /api/admin/employers/:id/approve
 *   PATCH  /api/admin/employers/:id/block   { block: true/false }
 *   PATCH  /api/admin/employers/:id/verify
 *   GET    /api/admin/payments
 */

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const adminApi = (token: string) =>
  axios.create({ baseURL: BASE, headers: { Authorization: `Bearer ${token}` } });

export default function AdminEmployerPanel({ adminToken }: { adminToken: string }) {
  const [employers, setEmployers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [tab, setTab] = useState<"employers" | "payments">("employers");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const api = adminApi(adminToken);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, payRes] = await Promise.all([
        api.get(`/admin/employers${filter !== "all" ? `?status=${filter}` : ""}`),
        api.get("/admin/payments"),
      ]);
      setEmployers(empRes.data.employers || []);
      setPayments(payRes.data.payments || []);
    } catch {
      toast.error("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const action = async (url: string, method: "patch" | "delete" = "patch", data?: object) => {
    try {
      await api[method](url, data);
      toast.success("Done!");
      fetchData();
    } catch {
      toast.error("Action failed.");
    }
  };

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {(["employers", "payments"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t === "employers" ? "🏢 Employers" : "💳 Payments"}
          </button>
        ))}
      </div>

      {tab === "employers" && (
        <>
          {/* Employer Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {["all", "pending", "approved", "blocked"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${filter === f ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
          ) : employers.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No employers found.</p>
          ) : (
            <div className="space-y-3">
              {employers.map((emp) => (
                <div key={emp._id} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{emp.companyName}</p>
                      {emp.isVerified && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">✓ Verified</span>}
                      {emp.isBlocked && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Blocked</span>}
                      {!emp.isApproved && !emp.isBlocked && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending</span>}
                      {emp.isApproved && !emp.isBlocked && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Approved</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{emp.email} · {emp.recruiterName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Plan: {emp.subscription?.plan || "none"} · Joined: {new Date(emp.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!emp.isApproved && (
                      <button onClick={() => action(`/admin/employers/${emp._id}/approve`)}
                        className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 font-medium">
                        ✅ Approve
                      </button>
                    )}
                    {!emp.isVerified && (
                      <button onClick={() => action(`/admin/employers/${emp._id}/verify`)}
                        className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 font-medium">
                        🏅 Verify Badge
                      </button>
                    )}
                    <button onClick={() => action(`/admin/employers/${emp._id}/block`, "patch", { block: !emp.isBlocked })}
                      className={`text-xs px-3 py-1.5 border rounded-lg font-medium ${emp.isBlocked ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"}`}>
                      {emp.isBlocked ? "🔓 Unblock" : "🚫 Block"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "payments" && (
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
          ) : payments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No payment records found.</p>
          ) : (
            payments.map((p) => (
              <div key={p._id} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{p.employer?.companyName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.employer?.email} · Plan: <strong className="capitalize">{p.plan}</strong></p>
                  <p className="text-xs text-gray-400 mt-0.5">₹{p.amount} · {new Date(p.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  p.status === "success" ? "bg-green-100 text-green-700" :
                  p.status === "failed" ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>{p.status}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}