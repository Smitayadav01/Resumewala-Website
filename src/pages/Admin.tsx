import { useEffect, useMemo, useState } from 'react';
import {
  Plus, Edit, Trash2, Users, Briefcase,
  Download, X, Building2, CheckCircle,
  XCircle, CreditCard, FileText, LayoutDashboard,
  Search, ArrowUpDown, RefreshCw, Eye, MapPin, Mail,
  Phone, Calendar, IndianRupee, ShieldCheck, Ban,
  Gift, ExternalLink, Inbox,
} from 'lucide-react';
import { toast } from 'sonner';
import { authFetch } from '../services/apiClient';
import { INDUSTRIES } from '../utils/industries';

const API_URL = import.meta.env.VITE_API_URL;

// ─── Types ────────────────────────────────────────────────────
interface AdminJob {
  _id: string;
  title: string;
  company?: string;
  location: string;
  experience?: string;
  industryCategory?: string;
  experienceRequired?: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType?: string;
  employmentType?: string;
  workMode?: string;
  description: string;
  requirements?: string[];
  keySkills?: string[];
  qualification?: string;
  postedDate?: string;
  createdAt?: string;
  status: string;
  postedBy?: string;
  isAdminApproved?: boolean;
  rejectionReason?: string;
  employer?: {
    _id: string;
    companyName: string;
    email: string;
    companyLogo?: string;
    recruiterName?: string;
  };
}

interface Candidate {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  skills: string[];
  resumeUrl: string;
  userId: string;
  createdAt?: string;
  isIncomplete?: boolean;
}

interface Employer {
  _id: string;
  companyName: string;
  recruiterName: string;
  email: string;
  mobile: string;
  companyLocation: string;
  isEmailVerified: boolean;
  isApproved: boolean;
  isBlocked: boolean;
  isVerified: boolean;
  subscription: { plan: string; jobCredits?: number; expiresAt?: string };
  createdAt: string;
}
interface UnifiedPayment {
  _id: string;
  type: 'employer_subscription' | 'resume_order';
  typeLabel: string;       // "Employer Plan" | "Resume Writing"
  name: string;            // company name OR customer name
  email: string;
  subLabel: string;        // recruiter name OR target job role
  plan: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  razorpayOrderId: string;
  razorpayPaymentId: string;
  jobCredits: number | null;
  validityDays: number | null;
  createdAt: string;
}

type TabKey =
  | 'dashboard' | 'jobs' | 'pendingJobs' | 'candidates'
  | 'employers' | 'payments' | 'applications' | 'resumeOrders';

// ─── Small shared UI primitives ────────────────────────────────
function Badge({
  children, tone = 'slate',
}: { children: React.ReactNode; tone?: 'slate' | 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'indigo' }) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600',
    green: 'bg-emerald-50 text-emerald-700',
    yellow: 'bg-amber-50 text-amber-700',
    red: 'bg-rose-50 text-rose-700',
    blue: 'bg-sky-50 text-sky-700',
    purple: 'bg-violet-50 text-violet-700',
    indigo: 'bg-indigo-50 text-indigo-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${tones[tone]}`}>
      {children}
    </span>
  );
}

function StatCard({
  label, value, icon, accent,
}: { label: string; value: string | number; icon: React.ReactNode; accent: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 pl-4 pr-5 py-4 flex items-center gap-4 min-w-[160px]">
      <div className="w-1 self-stretch rounded-full" style={{ backgroundColor: accent }} />
      <div className="flex items-center gap-3 flex-1">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          {icon}
        </div>
        <div>
          <p className="text-xl font-semibold text-slate-800 leading-tight">{value}</p>
          <p className="text-xs text-slate-500 mt-0.5">{label}</p>
        </div>
      </div>
    </div>
  );
}

function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-indigo-500 mb-3" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function EmptyState({
  icon, title, subtitle,
}: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
      <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-300">
        {icon}
      </div>
      <p className="text-slate-600 font-medium">{title}</p>
      {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function SectionHeader({
  title, subtitle, children,
}: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
    </div>
  );
}

function FilterPill({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition whitespace-nowrap ${
        active
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

function SearchInput({
  value, onChange, placeholder,
}: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
  );
}

function RefreshButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50"
    >
      <RefreshCw className="h-3.5 w-3.5" /> Refresh
    </button>
  );
}

const timeAgo = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const diffMs = Date.now() - d.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ─── Job Approval Card Component ─────────────────────────────
function JobApprovalCard({
  job, onApprove, onReject,
}: {
  job: AdminJob;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}) {
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1 min-w-0">

          <div className="flex items-start gap-3 mb-3 flex-wrap">
            {job.employer?.companyLogo ? (
              <img
                src={job.employer.companyLogo}
                className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                alt=""
              />
            ) : (
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                {(job.employer?.companyName || 'E')[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-900 text-base">{job.title}</h3>
                <Badge tone="yellow">Pending review</Badge>
              </div>
              <p className="text-indigo-600 font-medium text-sm mt-0.5">
                {job.employer?.companyName}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 mb-3">
            {job.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>}
            {(job.employmentType || job.jobType) && <span>{job.employmentType || job.jobType}</span>}
            {job.workMode && <span>{job.workMode}</span>}
            {(job.experienceRequired || job.experience) && <span>{job.experienceRequired || job.experience}</span>}
            {job.employer?.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{job.employer.email}</span>}
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtDate(job.createdAt)}</span>
          </div>

          <p className={`text-sm text-slate-600 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
            {job.description}
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-indigo-600 hover:underline mt-1"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>

          {(job.keySkills?.length || job.requirements?.length) ? (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(job.keySkills?.length ? job.keySkills : job.requirements || []).slice(0, 6).map((s) => (
                <span key={s} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-md">
                  {s}
                </span>
              ))}
            </div>
          ) : null}

          {showReject && (
            <div className="mt-4 p-4 bg-rose-50 rounded-xl border border-rose-200">
              <label className="block text-xs font-semibold text-rose-700 mb-2">
                Rejection reason (optional — emailed to employer)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="e.g. Incomplete description, misleading salary, policy violation..."
                className="w-full text-sm border border-rose-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none bg-white"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => { onReject(job._id, reason); setShowReject(false); setReason(''); }}
                  className="text-xs px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-semibold"
                >
                  Confirm reject
                </button>
                <button
                  onClick={() => { setShowReject(false); setReason(''); }}
                  className="text-xs px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {!showReject && (
          <div className="flex gap-2 flex-shrink-0 flex-wrap md:flex-col">
            <button
              onClick={() => onApprove(job._id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition whitespace-nowrap"
            >
              <CheckCircle className="h-4 w-4" /> Approve
            </button>
            <button
              onClick={() => setShowReject(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-sm font-semibold rounded-lg transition whitespace-nowrap"
            >
              <XCircle className="h-4 w-4" /> Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResumeOrderCard({
  order,
  onUpdateStatus,
  onViewResume,
}: {
  order: any;
  onUpdateStatus: (id: string, status: string, notes?: string) => void;
  onViewResume: (orderId: string) => void;
}) {
  const [notes, setNotes] = useState(order.adminNotes || '');
  const [showNotes, setShowNotes] = useState(false);

  const STATUS_TONE: Record<string, 'blue' | 'yellow' | 'purple' | 'green' | 'red'> = {
    new: 'blue',
    contacted: 'yellow',
    in_progress: 'purple',
    delivered: 'green',
    cancelled: 'red',
  };

 const PACKAGE_LABELS: Record<string, string> = {
  basic: 'Basic – ₹99',
  professional: 'Fresher / Early-Career Resume – ₹99',
  linkedin: 'LinkedIn – ₹99',
};

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h3 className="font-semibold text-slate-900">{order.name}</h3>
            <Badge tone={STATUS_TONE[order.status] || 'slate'}>
              {order.status?.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </Badge>
            <Badge tone="indigo">{PACKAGE_LABELS[order.package] || order.package}</Badge>
            {order.paymentStatus === 'paid' && <Badge tone="green">Paid</Badge>}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{order.email}</span>
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{order.mobile}</span>
            <span>Target: {order.targetRole}</span>
            {order.experience && <span>{order.experience}</span>}
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtDate(order.createdAt)}</span>
            <span>#{order._id.slice(-6).toUpperCase()}</span>
          </div>

          {order.message && (
            <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 mb-2 italic">
              "{order.message}"
            </p>
          )}

         {order.resumePublicId || order.resumeUrl ? (
  <button
    onClick={() => onViewResume(order._id)}
    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:underline mb-2"
  >
    <FileText className="h-3.5 w-3.5" />
    View uploaded resume
  </button>
) : order.resumeFile ? (
  <a
    href={`${import.meta.env.VITE_API_URL}/uploads/${order.resumeFile}`}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 text-xs text-amber-600 hover:underline mb-2"
  >
    <FileText className="h-3.5 w-3.5" />
    View uploaded resume (legacy)
  </a>
) : (
  <p className="text-xs text-gray-400 mb-2">
    No resume uploaded
  </p>
)}

          {showNotes && (
            <div className="mt-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Add internal notes..."
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0 min-w-[150px]">
          <a
            href={`https://wa.me/91${order.mobile}?text=Hi ${order.name}, this is Resumewala team. We received your resume order for the ${order.targetRole} role. Let us confirm the details!`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 font-medium text-center"
          >
            WhatsApp
          </a>

          <select
            value={order.status}
            onChange={(e) => onUpdateStatus(order._id, e.target.value, notes)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="in_progress">In Progress</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={order.paymentStatus}
            onChange={async (e) => {
              try {
                await authFetch(`/api/resume/orders/${order._id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ paymentStatus: e.target.value }),
                });
                toast.success('Payment status updated');
              } catch { toast.error('Failed'); }
            }}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>

          <button
            onClick={() => {
              if (showNotes && notes !== order.adminNotes) {
                onUpdateStatus(order._id, order.status, notes);
              }
              setShowNotes(!showNotes);
            }}
            className="text-xs px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 font-medium"
          >
            {showNotes ? 'Save notes' : 'Notes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Component ─────────────────────────────────────
export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  // Jobs
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [jobSearch, setJobSearch] = useState('');
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<AdminJob | null>(null);
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', experience: '',
    qualification: '', description: '', requirements: '',
    salary: '', jobType: 'Full-time',industryCategory: '',
  });

  // Candidates
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resumeOrderPreviewUrl, setResumeOrderPreviewUrl] = useState<string | null>(null);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidateSkillFilter, setCandidateSkillFilter] = useState('all');
  const [candidateCompletenessFilter, setCandidateCompletenessFilter] =
  useState<'all' | 'complete' | 'incomplete'>('all');
  const [candidateSort, setCandidateSort] = useState<'newest' | 'oldest' | 'name'>('newest');

  // Employers
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loadingEmployers, setLoadingEmployers] = useState(false);
  const [employerFilter, setEmployerFilter] = useState('all');
  const [employerSearch, setEmployerSearch] = useState('');
  const [planModal, setPlanModal] = useState<{ employerId: string; companyName: string } | null>(null);
  const [manualPlan, setManualPlan] = useState('basic');

  // Pending Jobs
  const [pendingJobs, setPendingJobs] = useState<AdminJob[]>([]);
  const [loadingPendingJobs, setLoadingPendingJobs] = useState(false);

  // Payments
   const [payments, setPayments] = useState<UnifiedPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [paymentSearch, setPaymentSearch] = useState('');

  // Applications
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('');
  const [appCompanyFilter, setAppCompanyFilter] = useState('');
  const [appTotal, setAppTotal] = useState(0);

  // Resume Orders
  const [resumeOrders, setResumeOrders] = useState<any[]>([]);
  const [loadingResumeOrders, setLoadingResumeOrders] = useState(false);
  const [resumeOrderFilter, setResumeOrderFilter] = useState('');

  const fetchResumeOrders = async () => {
    try {
      setLoadingResumeOrders(true);
      const q = resumeOrderFilter ? `?status=${resumeOrderFilter}` : '';
      const res = await authFetch(`/api/resume/orders${q}`);
      const data = await res.json();
      setResumeOrders(data.orders || []);
    } catch {
      toast.error('Failed to load resume orders');
    } finally {
      setLoadingResumeOrders(false);
    }
  };

  const updateResumeOrderStatus = async (id: string, status: string, notes: string = '') => {
    try {
      const res = await authFetch(`/api/resume/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Order status updated');
      fetchResumeOrders();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'resumeOrders') fetchResumeOrders();
  }, [activeTab, resumeOrderFilter]);

  // ── Fetch Functions ──────────────────────────────────────────
  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/jobs`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) { console.error(err); }
  };

  const fetchCandidates = async () => {
  try {
    setLoadingCandidates(true);
    const res = await authFetch('/api/admin/profiles');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed');
    setCandidates((data.profiles || []).map((p: any) => ({
      id: p._id,
      userId: p.userId,
      fullName: p.personal?.fullName || '',
      email: p.personal?.email || '',
      mobile: p.personal?.mobileNumbers || '',
      skills: p.skills || [],
      resumeUrl: p.resumeUrl || '#',
      createdAt: p.createdAt,
      isIncomplete: p.isIncomplete ?? (!p.personal?.fullName || !p.personal?.email),
    })));
  } catch (err: any) {
    toast.error(err.message);
  } finally {
    setLoadingCandidates(false);
  }
};

  const fetchEmployers = async () => {
    try {
      setLoadingEmployers(true);
      const q = employerFilter !== 'all' ? `?status=${employerFilter}` : '';
      const res = await authFetch(`/api/admin/employers${q}`);
      const data = await res.json();
      setEmployers(data.employers || []);
    } catch { toast.error('Failed to load employers'); }
    finally { setLoadingEmployers(false); }
  };

  const fetchPendingJobs = async () => {
    try {
      setLoadingPendingJobs(true);
      const res = await authFetch('/api/admin/jobs/pending');
      const data = await res.json();
      setPendingJobs(data.jobs || []);
    } catch { toast.error('Failed to load pending jobs'); }
    finally { setLoadingPendingJobs(false); }
  };

  const fetchPayments = async () => {
  try {
    setLoadingPayments(true);
    const params = new URLSearchParams();
    if (paymentFilter !== 'all') params.set('status', paymentFilter);
    if (paymentSearch) params.set('search', paymentSearch);
 
    const res = await authFetch(`/api/admin/payments?${params.toString()}`);
    const data = await res.json();
    setPayments(data.payments || []);
  } catch {
    toast.error('Failed to load payments');
  } finally {
    setLoadingPayments(false);
  }
};


  const fetchApplications = async () => {
    try {
      setLoadingApplications(true);
      const params = new URLSearchParams();
      if (appSearch) params.set('search', appSearch);
      if (appStatusFilter) params.set('status', appStatusFilter);
      if (appCompanyFilter) params.set('companyName', appCompanyFilter);

      const res = await authFetch(`/api/admin/applications?${params.toString()}`);
      const data = await res.json();
      setApplications(data.applications || []);
      setAppTotal(data.total || 0);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoadingApplications(false);
    }
  };

  useEffect(() => { fetchJobs(); fetchCandidates(); }, []);
  useEffect(() => { if (activeTab === 'employers') fetchEmployers(); }, [activeTab, employerFilter]);
  useEffect(() => { if (activeTab === 'pendingJobs') fetchPendingJobs(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'payments') fetchPayments(); }, [activeTab, paymentFilter,paymentSearch]);
  useEffect(() => { if (activeTab === 'applications') fetchApplications(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'dashboard') { fetchPendingJobs(); fetchPayments(); } }, [activeTab]);

  // ── Employer Actions ─────────────────────────────────────────
  const handleApproveEmployer = async (id: string) => {
    try {
      const res = await authFetch(`/api/admin/employers/${id}/approve`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Employer approved! Email sent.');
      fetchEmployers();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleBlockEmployer = async (id: string, block: boolean) => {
    try {
      const res = await authFetch(`/api/admin/employers/${id}/block`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ block }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`Employer ${block ? 'blocked' : 'unblocked'}.`);
      fetchEmployers();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleVerifyEmployer = async (id: string) => {
    try {
      const res = await authFetch(`/api/admin/employers/${id}/verify`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Verified badge granted!');
      fetchEmployers();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleSetPlan = async () => {
    if (!planModal) return;
    try {
      const res = await authFetch(`/api/admin/employers/${planModal.employerId}/set-plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: manualPlan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`${manualPlan.toUpperCase()} plan assigned to ${planModal.companyName}`);
      setPlanModal(null);
      fetchEmployers();
    } catch (err: any) { toast.error(err.message); }
  };

  // ── Job Approval Actions ─────────────────────────────────────
  const handleApproveJob = async (id: string) => {
    try {
      const res = await authFetch(`/api/admin/jobs/${id}/approve`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Job approved! Employer notified by email.');
      fetchPendingJobs();
      fetchJobs();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleRejectJob = async (id: string, reason: string = '') => {
    try {
      const res = await authFetch(`/api/admin/jobs/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Job rejected. Employer notified.');
      fetchPendingJobs();
      fetchJobs();
    } catch (err: any) { toast.error(err.message); }
  };

  // ── Candidate Actions ────────────────────────────────────────
  const downloadResume = async (id: string) => {
    try {
      const res = await authFetch(`/api/admin/download-resume/${id}`);
      if (!res.ok) throw new Error('Failed to download');
      const blob = await res.blob();
      const contentDisposition = res.headers.get('content-disposition');
      let fileName = 'resume.pdf';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match?.[1]) fileName = match[1];
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = fileName;
      document.body.appendChild(link); link.click();
      link.remove(); window.URL.revokeObjectURL(url);
    } catch (err: any) { toast.error(err.message); }
  };

  const handleViewResume = async (id: string) => {
    try {
      const res = await authFetch(`/api/admin/download-resume/${id}`);
      if (!res.ok) throw new Error('Failed to load');
      const blob = await res.blob();
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (err: any) { toast.error(err.message); }
  };

  const handleViewOrderResume = async (orderId: string) => {
  try {
    const res = await authFetch(`/api/resume/orders/${orderId}/view-resume`);

    if (!res.ok) {
      throw new Error('Failed to load resume');
    }

    const blob = await res.blob();

    // Clean up previous preview URL if one exists
    if (resumeOrderPreviewUrl) {
      URL.revokeObjectURL(resumeOrderPreviewUrl);
    }

    setResumeOrderPreviewUrl(URL.createObjectURL(blob));
  } catch (err: any) {
    toast.error(err.message || 'Failed to load resume');
  }
};

  const deleteCandidate = async (id: string) => {
    try {
      const res = await authFetch(`/api/admin/profile/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Candidate deleted');
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      setDeleteCandidateId(null);
    } catch (err: any) { toast.error(err.message); }
  };

  // ── Admin Job CRUD ───────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const openJobModal = (job?: AdminJob) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title,
        company: job.company || '',
        location: job.location,
        experience: job.experience || job.experienceRequired || '',
        qualification: job.qualification || '',
        description: job.description,
        requirements: (job.requirements || job.keySkills || []).join(', '),
        salary: job.salary || '',
        jobType: job.jobType || job.employmentType || 'Full-time',
        industryCategory: job.industryCategory || '',
      });
    } else {
      setEditingJob(null);
      setFormData({
        title: '', company: '', location: '', experience: '',
        qualification: '', description: '', requirements: '',
        salary: '', jobType: 'Full-time',industryCategory: '',
      });
    }
    setShowJobModal(true);
  };

  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingJob
        ? `${API_URL}/api/jobs/${editingJob._id}`
        : `${API_URL}/api/jobs`;
      const method = editingJob ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          requirements: formData.requirements.split(',').map((r) => r.trim()).filter(Boolean),
          postedBy: 'admin',
          status: 'Active',
          isAdminApproved: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      toast.success(editingJob ? 'Job updated!' : 'Job posted successfully!');
      setShowJobModal(false);
      fetchJobs();
    } catch (error: any) { toast.error(error.message); }
  };

  const handleDeleteJob = async (_id: string) => {
    if (!window.confirm('Delete this job? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_URL}/api/jobs/${_id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Job deleted');
      fetchJobs();
    } catch (error: any) { toast.error(error.message); }
  };

  // ── Derived / filtered data ──────────────────────────────────
  const filteredJobs = useMemo(() => {
    if (!jobSearch) return jobs;
    const q = jobSearch.toLowerCase();
    return jobs.filter((j) =>
      j.title?.toLowerCase().includes(q) ||
      j.company?.toLowerCase().includes(q) ||
      j.employer?.companyName?.toLowerCase().includes(q) ||
      j.location?.toLowerCase().includes(q)
    );
  }, [jobs, jobSearch]);

  const candidateSkillOptions = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach((c) => c.skills.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [candidates]);

  const visibleCandidates = useMemo(() => {
  let list = [...candidates];
  if (candidateSearch) {
    const q = candidateSearch.toLowerCase();
    list = list.filter((c) =>
      c.fullName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.mobile?.toLowerCase().includes(q) ||
      c.skills.some((s) => s.toLowerCase().includes(q))
    );
  }
  if (candidateSkillFilter !== 'all') {
    list = list.filter((c) => c.skills.includes(candidateSkillFilter));
  }
  if (candidateCompletenessFilter === 'complete') {
    list = list.filter((c) => !c.isIncomplete);
  } else if (candidateCompletenessFilter === 'incomplete') {
    list = list.filter((c) => c.isIncomplete);
  }
  list.sort((a, b) => {
    if (candidateSort === 'name') return a.fullName.localeCompare(b.fullName);
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return candidateSort === 'newest' ? tb - ta : ta - tb;
  });
  return list;
}, [candidates, candidateSearch, candidateSkillFilter, candidateCompletenessFilter, candidateSort]);

  const filteredEmployers = useMemo(() => {
    if (!employerSearch) return employers;
    const q = employerSearch.toLowerCase();
    return employers.filter((e) =>
      e.companyName?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.recruiterName?.toLowerCase().includes(q)
    );
  }, [employers, employerSearch]);

  const filteredPayments = payments;

  const paymentStats = {
  total: payments.length,
  success: payments.filter(p => p.status === 'success').length,
  pending: payments.filter(p => p.status === 'pending').length,
  failed: payments.filter(p => p.status === 'failed').length,
  revenue: payments.filter(p => p.status === 'success').reduce((s, p) => s + p.amount, 0),
};

  // ── Nav config ───────────────────────────────────────────────
  const navItems: { key: TabKey; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: 'jobs', label: 'All Jobs', icon: <Briefcase className="h-4 w-4" /> },
    { key: 'pendingJobs', label: 'Approvals', icon: <CheckCircle className="h-4 w-4" />, badge: pendingJobs.length },
    { key: 'candidates', label: 'Candidates', icon: <Users className="h-4 w-4" /> },
    { key: 'employers', label: 'Employers', icon: <Building2 className="h-4 w-4" /> },
    { key: 'payments', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
    { key: 'applications', label: 'Applications', icon: <FileText className="h-4 w-4" /> },
    { key: 'resumeOrders', label: 'Resume Orders', icon: <FileText className="h-4 w-4" /> },
  ];

  const pageMeta: Record<TabKey, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Overview of jobs, candidates, employers and revenue' },
    jobs: { title: 'All Jobs', subtitle: `${jobs.length} listings across the platform` },
    pendingJobs: { title: 'Pending Approvals', subtitle: 'Review employer-submitted jobs before they go live' },
    candidates: { title: 'Candidates', subtitle: `${candidates.length} registered candidates` },
    employers: { title: 'Employers', subtitle: `${employers.length} employer accounts` },
    payments: { title: 'Payments', subtitle: `${payments.length} transactions recorded` },
    applications: { title: 'Applications', subtitle: `${appTotal} candidate applications` },
    resumeOrders: { title: 'Resume Orders', subtitle: `${resumeOrders.length} orders received` },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 bg-blue-700 text-blue-200 flex-shrink-0 min-h-screen">
        {/* <div className="px-5 py-6 border-b border-blue-900 bg-white">
          <p className="text-gray-900 font-semibold text-lg leading-tight">Admin Panel</p>
          <p className="text-xs text-gray-500/70 mt-0.5">Recruitment platform control center</p>
        </div> */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === item.key
                  ? 'bg-white text-blue-900'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">{item.icon}{item.label}</span>
              {!!item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === item.key ? 'bg-blue-900/10 text-blue-900' : 'bg-blue-400/20 text-blue-100'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Mobile top nav ── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-blue-900 border-t border-blue-800 flex overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            className={`flex flex-col items-center gap-1 px-4 py-2.5 text-[10px] font-medium flex-shrink-0 ${
              activeTab === item.key ? 'text-white' : 'text-blue-300'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 pb-20 lg:pb-0">
        <header className="bg-white border-b border-slate-200 px-5 sm:px-8 py-5 sticky top-0 z-30">
          <h1 className="text-xl font-semibold text-slate-900">{pageMeta[activeTab].title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{pageMeta[activeTab].subtitle}</p>
        </header>

        <main className="px-5 sm:px-8 py-6">

          {/* ── DASHBOARD ─────────────────────────────────────── */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <StatCard label="Total jobs" value={jobs.length} icon={<Briefcase className="h-4 w-4" />} accent="#4F46E5" />
                <StatCard label="Pending approvals" value={pendingJobs.length} icon={<CheckCircle className="h-4 w-4" />} accent="#D97706" />
                <StatCard label="Candidates" value={candidates.length} icon={<Users className="h-4 w-4" />} accent="#0EA5E9" />
                <StatCard label="Employers" value={employers.length || '—'} icon={<Building2 className="h-4 w-4" />} accent="#7C3AED" />
                <StatCard label="Revenue" value={`₹${paymentStats.revenue.toLocaleString('en-IN')}`} icon={<IndianRupee className="h-4 w-4" />} accent="#16A34A" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <SectionHeader title="Needs your attention" subtitle="Jobs waiting for review" />
                  {pendingJobs.length === 0 ? (
                    <EmptyState icon={<CheckCircle className="h-5 w-5" />} title="All caught up" subtitle="No pending employer jobs to review." />
                  ) : (
                    <div className="space-y-2">
                      {pendingJobs.slice(0, 5).map((job) => (
                        <div key={job._id} className="flex items-center justify-between text-sm border-b border-slate-100 last:border-0 py-2">
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate">{job.title}</p>
                            <p className="text-xs text-slate-500 truncate">{job.employer?.companyName}</p>
                          </div>
                          <button
                            onClick={() => setActiveTab('pendingJobs')}
                            className="text-xs text-indigo-600 font-medium hover:underline flex-shrink-0 ml-3"
                          >
                            Review
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <SectionHeader title="Recent payments" subtitle="Latest transactions" />
                  {payments.length === 0 ? (
                    <EmptyState icon={<CreditCard className="h-5 w-5" />} title="No payments yet" />
                  ) : (
                    <div className="space-y-2">
                      {payments.slice(0, 5).map((p) => (
                        <div key={p._id} className="flex items-center justify-between text-sm border-b border-slate-100 last:border-0 py-2">
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate">{p.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{fmtDate(p.createdAt)} · {p.typeLabel} · {p.plan}</p>
                          </div>
                          <span className="text-sm font-semibold text-slate-700 flex-shrink-0 ml-3">
                            ₹{p.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── ALL JOBS TAB ─────────────────────────────────── */}
          {activeTab === 'jobs' && (
            <div>
              <SectionHeader title="All job listings" subtitle={`${filteredJobs.length} of ${jobs.length} jobs`}>
                <SearchInput value={jobSearch} onChange={setJobSearch} placeholder="Search title, company, location..." />
                <button
                  onClick={() => openJobModal()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 text-sm whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" /> Post job
                </button>
              </SectionHeader>

              {jobs.length === 0 ? (
                <EmptyState icon={<Briefcase className="h-5 w-5" />} title="No jobs posted yet" />
              ) : filteredJobs.length === 0 ? (
                <EmptyState icon={<Search className="h-5 w-5" />} title="No jobs match your search" />
              ) : (
                <div className="space-y-3">
                  {filteredJobs.map((job) => (
                    <div key={job._id} className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <h3 className="font-semibold text-slate-800">{job.title}</h3>
                            <Badge tone={job.postedBy === 'employer' ? 'purple' : 'indigo'}>
                              {job.postedBy === 'employer' ? 'Employer' : 'Admin'}
                            </Badge>
                            {job.postedBy === 'employer' ? (
                              <Badge tone={job.status === 'approved' ? 'green' : job.status === 'rejected' ? 'red' : 'yellow'}>
                                {job.status === 'approved' ? 'Approved' : job.status === 'rejected' ? 'Rejected' : 'Pending'}
                              </Badge>
                            ) : (
                              <Badge tone="green">Live</Badge>
                            )}
                          </div>

                          <p className="text-indigo-600 font-medium text-sm mb-2">
                            {job.employer?.companyName || job.company || '—'}
                          </p>

                          <div className="grid sm:grid-cols-4 gap-2 text-xs text-slate-500">
  <span className="flex items-center gap-1">
    <MapPin className="h-3 w-3" />
    {job.location}
  </span>

  {job.industryCategory && (
    <div>
      <span className="font-medium">Industry:</span>{" "}
      {job.industryCategory}
    </div>
  )}

  <span>
    {job.experience || job.experienceRequired || '—'}
  </span>

  <span className="flex items-center gap-1">
    <IndianRupee className="h-3 w-3" />
    {job.salary || (job.salaryMin ? `${(job.salaryMin / 100000).toFixed(1)}L` : '—')}
  </span>
</div>
                        </div>

                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => openJobModal(job)}
                            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job._id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PENDING APPROVALS TAB ────────────────────────── */}
          {activeTab === 'pendingJobs' && (
            <div>
              <SectionHeader title="Pending job approvals">
                <RefreshButton onClick={fetchPendingJobs} />
              </SectionHeader>

              <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                Only employer-submitted jobs appear here. Admin-posted jobs are automatically live.
              </div>

              {loadingPendingJobs ? (
                <LoadingBlock label="Loading pending jobs…" />
              ) : pendingJobs.length === 0 ? (
                <EmptyState icon={<CheckCircle className="h-5 w-5" />} title="All caught up" subtitle="No pending employer jobs to review." />
              ) : (
                <div className="space-y-4">
                  {pendingJobs.map((job) => (
                    <JobApprovalCard
                      key={job._id}
                      job={job}
                      onApprove={handleApproveJob}
                      onReject={handleRejectJob}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CANDIDATES TAB ───────────────────────────────── */}
          {activeTab === 'candidates' && (
            <div>
              <SectionHeader
  title="Registered candidates"
  subtitle={`${visibleCandidates.length} of ${candidates.length} shown · ${candidates.filter(c => c.isIncomplete).length} incomplete profiles`}
>
  <SearchInput value={candidateSearch} onChange={setCandidateSearch} placeholder="Search name, email, mobile, skill..." />
  <div className="flex gap-1.5">
    <FilterPill active={candidateCompletenessFilter === 'all'} onClick={() => setCandidateCompletenessFilter('all')}>
      All
    </FilterPill>
    <FilterPill active={candidateCompletenessFilter === 'complete'} onClick={() => setCandidateCompletenessFilter('complete')}>
      Complete
    </FilterPill>
    <FilterPill active={candidateCompletenessFilter === 'incomplete'} onClick={() => setCandidateCompletenessFilter('incomplete')}>
      Incomplete
    </FilterPill>
  </div>
  <select
    value={candidateSkillFilter}
    onChange={(e) => setCandidateSkillFilter(e.target.value)}
    className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
  >
    <option value="all">All skills</option>
    {candidateSkillOptions.map((s) => (
      <option key={s} value={s}>{s}</option>
    ))}
  </select>
  <button
    onClick={() => setCandidateSort(candidateSort === 'newest' ? 'oldest' : candidateSort === 'oldest' ? 'name' : 'newest')}
    className="flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 whitespace-nowrap"
    title="Change sort order"
  >
    <ArrowUpDown className="h-3.5 w-3.5" />
    {candidateSort === 'newest' ? 'Newest first' : candidateSort === 'oldest' ? 'Oldest first' : 'Name A–Z'}
  </button>
</SectionHeader>

              {loadingCandidates ? (
                <LoadingBlock label="Loading candidates…" />
              ) : candidates.length === 0 ? (
                <EmptyState icon={<Users className="h-5 w-5" />} title="No candidates registered yet" />
              ) : visibleCandidates.length === 0 ? (
                <EmptyState icon={<Search className="h-5 w-5" />} title="No candidates match your filters" />
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {['Candidate', 'Contact', 'Skills', 'Registered', 'Actions'].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleCandidates.map((candidate) => (
                       <tr key={candidate.id} className={`hover:bg-slate-50 transition ${candidate.isIncomplete ? 'bg-amber-50/50' : ''}`}>
  <td className="px-5 py-4">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold text-xs flex-shrink-0">
        {(candidate.fullName || '?')[0]?.toUpperCase()}
      </div>
      <div>
        <span className="font-medium text-slate-800">
          {candidate.fullName || 'No name provided'}
        </span>
        {candidate.isIncomplete && (
          <div className="mt-0.5"><Badge tone="yellow">Incomplete profile</Badge></div>
        )}
      </div>
    </div>
  </td>
  <td className="px-5 py-4 text-slate-600">
    <div className="flex flex-col gap-0.5 text-xs">
      <span className="flex items-center gap-1">
        <Mail className="h-3 w-3 text-slate-400" />
        {candidate.email || <span className="text-slate-300">Not provided</span>}
      </span>
      <span className="flex items-center gap-1">
        <Phone className="h-3 w-3 text-slate-400" />
        {candidate.mobile || <span className="text-slate-300">Not provided</span>}
      </span>
    </div>
  </td>
  <td className="px-5 py-4">
    <div className="flex flex-wrap gap-1 max-w-[220px]">
      {candidate.skills.slice(0, 3).map((skill) => (
        <Badge key={skill} tone="blue">{skill}</Badge>
      ))}
      {candidate.skills.length > 3 && (
        <span className="text-slate-400 text-xs">+{candidate.skills.length - 3}</span>
      )}
      {candidate.skills.length === 0 && <span className="text-slate-300 text-xs">—</span>}
    </div>
  </td>
  <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
    {timeAgo(candidate.createdAt)}
  </td>
  <td className="px-5 py-4">
    <div className="flex items-center gap-3">
      <button onClick={() => handleViewResume(candidate.id)} className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-xs font-medium">
        <Eye className="h-3.5 w-3.5" /> View
      </button>
      <button onClick={() => downloadResume(candidate.id)} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs font-medium">
        <Download className="h-3.5 w-3.5" /> Download
      </button>
      <button onClick={() => setDeleteCandidateId(candidate.id)} className="flex items-center gap-1 text-rose-500 hover:text-rose-600 text-xs font-medium">
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </button>
    </div>
  </td>
</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── EMPLOYERS TAB ────────────────────────────────── */}
          {activeTab === 'employers' && (
            <div>
              <SectionHeader title="Employer accounts" subtitle={`${filteredEmployers.length} of ${employers.length} shown`}>
                <SearchInput value={employerSearch} onChange={setEmployerSearch} placeholder="Search company, recruiter, email..." />
              </SectionHeader>

              <div className="flex gap-2 flex-wrap mb-5">
                {['all', 'pending', 'approved', 'blocked'].map((f) => (
                  <FilterPill key={f} active={employerFilter === f} onClick={() => setEmployerFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </FilterPill>
                ))}
              </div>

              {loadingEmployers ? (
                <LoadingBlock label="Loading employers…" />
              ) : employers.length === 0 ? (
                <EmptyState icon={<Building2 className="h-5 w-5" />} title="No employers found" />
              ) : filteredEmployers.length === 0 ? (
                <EmptyState icon={<Search className="h-5 w-5" />} title="No employers match your search" />
              ) : (
                <div className="space-y-3">
                  {filteredEmployers.map((emp) => (
                    <div key={emp._id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-slate-900">{emp.companyName}</h3>
                            {emp.isVerified && <Badge tone="blue"><ShieldCheck className="h-3 w-3" /> Verified</Badge>}
                            {emp.isBlocked && <Badge tone="red"><Ban className="h-3 w-3" /> Blocked</Badge>}
                            {!emp.isApproved && !emp.isBlocked && <Badge tone="yellow">Pending</Badge>}
                            {emp.isApproved && !emp.isBlocked && <Badge tone="green">Approved</Badge>}
                          </div>
                          <p className="text-sm text-slate-600 mb-1">
                            {emp.recruiterName} · {emp.email}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{emp.companyLocation}</span>
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{emp.mobile}</span>
                            <span>Plan: {emp.subscription?.plan || 'none'}</span>
                            {emp.subscription?.expiresAt && <span>Expires {fmtDate(emp.subscription.expiresAt)}</span>}
                            <span>Joined {fmtDate(emp.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {!emp.isApproved && !emp.isBlocked && (
                            <button
                              onClick={() => handleApproveEmployer(emp._id)}
                              className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                            >
                              Approve
                            </button>
                          )}
                          {emp.isApproved && !emp.isVerified && (
                            <button
                              onClick={() => handleVerifyEmployer(emp._id)}
                              className="text-xs px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg hover:bg-sky-100 font-medium"
                            >
                              Verify
                            </button>
                          )}
                          <button
                            onClick={() => setPlanModal({ employerId: emp._id, companyName: emp.companyName })}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg hover:bg-violet-100 font-medium"
                          >
                            <Gift className="h-3.5 w-3.5" /> Plan
                          </button>
                          <button
                            onClick={() => handleBlockEmployer(emp._id, !emp.isBlocked)}
                            className={`text-xs px-3 py-1.5 border rounded-lg font-medium ${
                              emp.isBlocked
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            {emp.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── RESUME ORDERS TAB ────────────────────────────── */}
          {activeTab === 'resumeOrders' && (
            <div>
              <SectionHeader title="Resume writing orders">
                <RefreshButton onClick={fetchResumeOrders} />
              </SectionHeader>

              <div className="flex gap-2 flex-wrap mb-5">
                {['', 'new', 'contacted', 'in_progress', 'delivered', 'cancelled'].map((s) => (
                  <FilterPill key={s} active={resumeOrderFilter === s} onClick={() => setResumeOrderFilter(s)}>
                    {s === '' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </FilterPill>
                ))}
              </div>

              {loadingResumeOrders ? (
                <LoadingBlock label="Loading resume orders…" />
              ) : resumeOrders.length === 0 ? (
                <EmptyState icon={<FileText className="h-5 w-5" />} title="No resume orders yet" />
              ) : (
                <div className="space-y-4">
                  {resumeOrders.map((order: any) => (
  <ResumeOrderCard
    key={order._id}
    order={order}
    onUpdateStatus={updateResumeOrderStatus}
    onViewResume={handleViewOrderResume}
  />
))}
                </div>
              )}
            </div>
          )}

          {/* ── PAYMENTS TAB ─────────────────────────────────── */}
          {activeTab === 'payments' && (
            <div>
              <SectionHeader title="Payment records">
                <RefreshButton onClick={fetchPayments} />
              </SectionHeader>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <StatCard label="Total" value={paymentStats.total} icon={<CreditCard className="h-4 w-4" />} accent="#64748B" />
                <StatCard label="Successful" value={paymentStats.success} icon={<CheckCircle className="h-4 w-4" />} accent="#16A34A" />
                <StatCard label="Pending" value={paymentStats.pending} icon={<Calendar className="h-4 w-4" />} accent="#D97706" />
                <StatCard label="Failed" value={paymentStats.failed} icon={<XCircle className="h-4 w-4" />} accent="#DC2626" />
                <StatCard label="Revenue" value={`₹${paymentStats.revenue.toLocaleString('en-IN')}`} icon={<IndianRupee className="h-4 w-4" />} accent="#4F46E5" />
              </div>

              <div className="flex flex-wrap gap-3 mb-5">
                <div className="flex gap-2 flex-wrap">
                  {['all', 'success', 'pending', 'failed'].map((f) => (
                    <FilterPill key={f} active={paymentFilter === f} onClick={() => setPaymentFilter(f)}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </FilterPill>
                  ))}
                </div>
                <SearchInput value={paymentSearch} onChange={setPaymentSearch} placeholder="Search company, email, plan, payment ID..." />
              </div>

            {loadingPayments ? (
                <LoadingBlock label="Loading payments…" />
              ) : filteredPayments.length === 0 ? (
                <EmptyState icon={<CreditCard className="h-5 w-5" />} title="No payment records found" />
              ) : (
                <div className="space-y-3">
                  {filteredPayments.map((p) => (
                    <div key={p._id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-slate-900">{p.name || 'Unknown'}</h3>
                            <Badge tone={p.type === 'resume_order' ? 'purple' : 'indigo'}>
                              {p.typeLabel}
                            </Badge>
                            <Badge tone={p.plan === 'premium' ? 'purple' : p.plan === 'standard' ? 'blue' : 'slate'}>
                              {p.plan} plan
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-1">
                            {p.subLabel ? `${p.subLabel} · ` : ''}{p.email}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                            <span className="font-semibold text-slate-700">₹{p.amount.toLocaleString('en-IN')}</span>
                            <span>{fmtDate(p.createdAt)}</span>
                            {p.jobCredits != null && (
                              <span>Credits: {p.jobCredits === 99999 ? '∞' : p.jobCredits}</span>
                            )}
                            {p.validityDays != null && <span>Validity: {p.validityDays} days</span>}
                            {p.razorpayPaymentId && <span className="font-mono">ID: {p.razorpayPaymentId}</span>}
                          </div>
                        </div>
                        <Badge tone={p.status === 'success' ? 'green' : p.status === 'failed' ? 'red' : 'yellow'}>
                          {p.status === 'success' ? 'Paid' : p.status === 'failed' ? 'Failed' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── APPLICATIONS TAB ─────────────────────────────── */}
          {activeTab === 'applications' && (
            <div>
              <SectionHeader title="Employer job applications" subtitle={`${appTotal} total applications`}>
                <RefreshButton onClick={fetchApplications} />
              </SectionHeader>

              <div className="flex flex-wrap gap-3 mb-5">
                <SearchInput
                  value={appSearch}
                  onChange={setAppSearch}
                  placeholder="Search candidate, job, company..."
                />
                <select
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">All statuses</option>
                  <option value="Applied">Applied</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <button
                  onClick={fetchApplications}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  Search
                </button>
              </div>

              {loadingApplications ? (
                <LoadingBlock label="Loading applications…" />
              ) : applications.length === 0 ? (
                <EmptyState
                  icon={<Inbox className="h-5 w-5" />}
                  title="No applications found"
                  subtitle="Applications appear here when candidates apply to employer jobs."
                />
              ) : (
                <div className="space-y-3">
                  {applications.map((app: any) => (
                    <div key={app._id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <div className="w-9 h-9 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm flex-shrink-0">
                              {(app.candidateName || 'C')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{app.candidateName}</p>
                              <p className="text-xs text-slate-500">{app.candidateEmail}</p>
                            </div>
                            <span className="ml-auto md:ml-0">
                              <Badge tone={
                                app.status === 'Shortlisted' ? 'green' :
                                app.status === 'Rejected' ? 'red' :
                                app.status === 'Contacted' ? 'blue' : 'slate'
                              }>
                                {app.status}
                              </Badge>
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-2">
                            <span className="font-medium text-slate-700">{app.jobTitle}</span>
                            <span>{app.companyName}</span>
                            {app.candidatePhone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{app.candidatePhone}</span>}
                            {app.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{app.location}</span>}
                            {app.experience && <span>{app.experience}</span>}
                            {app.education && <span>{app.education}</span>}
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtDate(app.appliedAt)}</span>
                          </div>

                          {app.keySkills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {app.keySkills.slice(0, 5).map((s: string, i: number) => (
                                <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-md">
                                  {s}
                                </span>
                              ))}
                              {app.keySkills.length > 5 && (
                                <span className="text-xs text-slate-400">+{app.keySkills.length - 5}</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex-shrink-0">
                          {app.resumeUrl ? (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 font-medium whitespace-nowrap"
                            >
                              <ExternalLink className="h-3.5 w-3.5" /> Resume
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">No resume</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ── Delete Candidate Modal ── */}
      {deleteCandidateId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Delete candidate?</h2>
            <p className="text-slate-600 text-sm mb-5">
              This removes the candidate's profile and cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteCandidateId(null)}
                className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCandidate(deleteCandidateId)}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Resume Preview Modal ── */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl h-[90vh] relative">
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-3 right-3 text-slate-500 hover:text-black z-10 bg-white rounded-full p-1 shadow"
            >
              <X className="h-5 w-5" />
            </button>
            <iframe src={previewUrl} className="w-full h-full rounded-xl" title="Resume Preview" />
          </div>
        </div>
      )}

      {resumeOrderPreviewUrl && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl w-full max-w-4xl h-[90vh] relative">
      <button
        onClick={() => {
          URL.revokeObjectURL(resumeOrderPreviewUrl);
          setResumeOrderPreviewUrl(null);
        }}
        className="absolute top-3 right-3 text-slate-500 hover:text-black z-10 bg-white rounded-full p-1 shadow"
      >
        <X className="h-5 w-5" />
      </button>

      <iframe
        src={resumeOrderPreviewUrl}
        className="w-full h-full rounded-xl"
        title="Resume Preview"
      />
    </div>
  </div>
)}

      {/* ── Set Plan Modal ── */}
      {planModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-1">Assign subscription plan</h2>
            <p className="text-sm text-slate-500 mb-4">{planModal.companyName}</p>
            <div className="space-y-2.5 mb-6">
              {[
                { value: 'none', label: 'No plan', desc: 'Remove subscription' },
                { value: 'basic', label: 'Basic', desc: '5 jobs / 30 days' },
                { value: 'standard', label: 'Standard', desc: '15 jobs / 60 days' },
                { value: 'premium', label: 'Premium', desc: 'Unlimited / 90 days' },
              ].map((p) => (
                <label key={p.value} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition ${
                  manualPlan === p.value ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio" name="plan" value={p.value}
                    checked={manualPlan === p.value}
                    onChange={() => setManualPlan(p.value)}
                    className="accent-indigo-600"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{p.label}</p>
                    <p className="text-xs text-slate-500">{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPlanModal(null)}
                className="flex-1 py-2.5 bg-slate-100 rounded-lg hover:bg-slate-200 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSetPlan}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold"
              >
                Assign plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add/Edit Admin Job Modal ── */}
      {showJobModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowJobModal(false)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingJob ? 'Edit job' : 'Post new job (admin)'}
              </h2>
              <button onClick={() => setShowJobModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!editingJob && (
              <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-xs text-indigo-700">
                Jobs posted by admin are automatically approved and immediately visible on Browse Jobs.
              </div>
            )}

            <form onSubmit={handleSubmitJob} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'title', label: 'Job title *', placeholder: 'e.g. Senior Frontend Developer', required: true, colSpan: 2 },
                  { name: 'company', label: 'Company name *', placeholder: 'e.g. Tech Solutions', required: true, colSpan: 1 },
                  { name: 'location', label: 'Location *', placeholder: 'e.g. Mumbai', required: true, colSpan: 1 },
                  { name: 'experience', label: 'Experience', placeholder: 'e.g. 2-4 years', required: false, colSpan: 1 },
                  { name: 'salary', label: 'Salary', placeholder: 'e.g. ₹8-12 LPA', required: false, colSpan: 1 },
                  { name: 'qualification', label: 'Qualification', placeholder: 'e.g. B.Tech / Any Graduate', required: false, colSpan: 2 },
                ].map((f) => (
                  <div key={f.name} className={f.colSpan === 2 ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                    <input
                      type="text" name={f.name}
                      value={(formData as any)[f.name]}
                      onChange={handleChange}
                      required={f.required}
                      placeholder={f.placeholder}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Job type</label>
                  <select
                    name="jobType" value={formData.jobType} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>

                <div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    Industry
  </label>

  <select
    name="industryCategory"
    value={formData.industryCategory}
    onChange={handleChange}
    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
  >
    <option value="">Select Industry (optional)</option>

    {INDUSTRIES.map((ind) => (
      <option key={ind} value={ind}>
        {ind}
      </option>
    ))}
  </select>
</div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Required skills (comma-separated)</label>
                  <input
                    type="text" name="requirements" value={formData.requirements}
                    onChange={handleChange} required
                    placeholder="e.g. React, Node.js, MongoDB"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Job description *</label>
                  <textarea
                    name="description" value={formData.description}
                    onChange={handleChange} required rows={4}
                    placeholder="Describe the role, responsibilities, and requirements..."
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold text-sm"
                >
                  {editingJob ? 'Update job' : 'Post job (auto-approved)'}
                </button>
                <button
                  type="button" onClick={() => setShowJobModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-lg hover:bg-slate-200 font-semibold text-sm"
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



// import { useEffect, useState } from 'react';
// import {
//   Plus, Edit, Trash2, Users, Briefcase,
//   Download, X, Building2, CheckCircle,
//   XCircle, CreditCard
// } from 'lucide-react';
// import { toast } from 'sonner';
// import { authFetch } from '../services/apiClient';

// const API_URL = import.meta.env.VITE_API_URL;

// // ─── Types ────────────────────────────────────────────────────
// interface AdminJob {
//   _id: string;
//   title: string;
//   company?: string;
//   location: string;
//   experience?: string;
//   experienceRequired?: string;
//   salary?: string;
//   salaryMin?: number;
//   salaryMax?: number;
//   jobType?: string;
//   employmentType?: string;
//   workMode?: string;
//   description: string;
//   requirements?: string[];
//   keySkills?: string[];
//   qualification?: string;
//   postedDate?: string;
//   createdAt?: string;
//   status: string;
//   postedBy?: string;
//   isAdminApproved?: boolean;
//   rejectionReason?: string;
//   employer?: {
//     _id: string;
//     companyName: string;
//     email: string;
//     companyLogo?: string;
//     recruiterName?: string;
//   };
// }

// interface Candidate {
//   id: string;
//   fullName: string;
//   email: string;
//   mobile: string;
//   skills: string[];
//   resumeUrl: string;
//   userId: string;
// }

// interface Employer {
//   _id: string;
//   companyName: string;
//   recruiterName: string;
//   email: string;
//   mobile: string;
//   companyLocation: string;
//   isEmailVerified: boolean;
//   isApproved: boolean;
//   isBlocked: boolean;
//   isVerified: boolean;
//   subscription: { plan: string; jobCredits?: number; expiresAt?: string };
//   createdAt: string;
// }

// interface Payment {
//   _id: string;
//   plan: string;
//   amount: number;
//   status: string;
//   createdAt: string;
//   razorpayOrderId: string;
//   razorpayPaymentId: string;
//   jobCredits: number;
//   validityDays: number;
//   employer: { companyName: string; email: string; recruiterName: string };
// }

// // ─── Job Approval Card Component ─────────────────────────────
// function JobApprovalCard({
//   job, onApprove, onReject,
// }: {
//   job: AdminJob;
//   onApprove: (id: string) => void;
//   onReject: (id: string, reason: string) => void;
// }) {
//   const [showReject, setShowReject] = useState(false);
//   const [reason, setReason] = useState('');
//   const [expanded, setExpanded] = useState(false);

//   return (
//     <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
//       <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
//         <div className="flex-1 min-w-0">

//           {/* Header */}
//           <div className="flex items-start gap-3 mb-3 flex-wrap">
//             {job.employer?.companyLogo ? (
//               <img
//                 src={job.employer.companyLogo}
//                 className="w-10 h-10 rounded-lg object-cover border flex-shrink-0"
//                 alt=""
//               />
//             ) : (
//               <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
//                 {(job.employer?.companyName || 'E')[0]}
//               </div>
//             )}
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-2 flex-wrap">
//                 <h3 className="font-bold text-gray-900 text-base">{job.title}</h3>
//                 <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full font-medium">
//                   ⏳ Pending
//                 </span>
//                 <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-medium">
//                   Posted by: Employer
//                 </span>
//               </div>
//               <p className="text-blue-600 font-medium text-sm mt-0.5">
//                 {job.employer?.companyName}
//               </p>
//             </div>
//           </div>

//           {/* Meta */}
//           <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
//             {job.location && <span>📍 {job.location}</span>}
//             {(job.employmentType || job.jobType) && <span>⏱ {job.employmentType || job.jobType}</span>}
//             {job.workMode && <span>💼 {job.workMode}</span>}
//             {(job.experienceRequired || job.experience) && <span>🏆 {job.experienceRequired || job.experience}</span>}
//             {job.employer?.email && <span>📧 {job.employer.email}</span>}
//             <span>📅 {new Date(job.createdAt || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
//           </div>

//           {/* Description */}
//           <p className={`text-sm text-gray-600 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
//             {job.description}
//           </p>
//           <button
//             onClick={() => setExpanded(!expanded)}
//             className="text-xs text-blue-600 hover:underline mt-1"
//           >
//             {expanded ? 'Show less ↑' : 'Read more ↓'}
//           </button>

//           {/* Skills */}
//           {(job.keySkills?.length || job.requirements?.length) ? (
//             <div className="flex flex-wrap gap-1.5 mt-3">
//               {(job.keySkills?.length ? job.keySkills : job.requirements || []).slice(0, 6).map((s) => (
//                 <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
//                   {s}
//                 </span>
//               ))}
//             </div>
//           ) : null}

//           {/* Reject form */}
//           {showReject && (
//             <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
//               <label className="block text-xs font-semibold text-red-700 mb-2">
//                 Rejection reason (optional — will be emailed to employer)
//               </label>
//               <textarea
//                 value={reason}
//                 onChange={(e) => setReason(e.target.value)}
//                 rows={2}
//                 placeholder="e.g. Incomplete description, misleading salary, policy violation..."
//                 className="w-full text-sm border border-red-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none bg-white"
//               />
//               <div className="flex gap-2 mt-3">
//                 <button
//                   onClick={() => { onReject(job._id, reason); setShowReject(false); setReason(''); }}
//                   className="text-xs px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
//                 >
//                   Confirm Reject
//                 </button>
//                 <button
//                   onClick={() => { setShowReject(false); setReason(''); }}
//                   className="text-xs px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Action Buttons */}
//         {!showReject && (
//           <div className="flex gap-2 flex-shrink-0 flex-wrap md:flex-col">
//             <button
//               onClick={() => onApprove(job._id)}
//               className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition whitespace-nowrap"
//             >
//               <CheckCircle className="h-4 w-4" /> Approve
//             </button>
//             <button
//               onClick={() => setShowReject(true)}
//               className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold rounded-lg transition whitespace-nowrap"
//             >
//               <XCircle className="h-4 w-4" /> Reject
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── Main Admin Component ─────────────────────────────────────
// export default function Admin() {
//   const [activeTab, setActiveTab] = useState<
//     'jobs' | 'pendingJobs' | 'candidates' | 'employers' | 'payments'
//   >('jobs');

//   // Jobs
//   const [jobs, setJobs] = useState<AdminJob[]>([]);
//   const [showJobModal, setShowJobModal] = useState(false);
//   const [editingJob, setEditingJob] = useState<AdminJob | null>(null);
//   const [formData, setFormData] = useState({
//     title: '', company: '', location: '', experience: '',
//     qualification: '', description: '', requirements: '',
//     salary: '', jobType: 'Full-time',
//   });

//   // Candidates
//   const [candidates, setCandidates] = useState<Candidate[]>([]);
//   const [loadingCandidates, setLoadingCandidates] = useState(false);
//   const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);

//   // Employers
//   const [employers, setEmployers] = useState<Employer[]>([]);
//   const [loadingEmployers, setLoadingEmployers] = useState(false);
//   const [employerFilter, setEmployerFilter] = useState('all');
//   const [planModal, setPlanModal] = useState<{ employerId: string; companyName: string } | null>(null);
//   const [manualPlan, setManualPlan] = useState('basic');

//   // Pending Jobs
//   const [pendingJobs, setPendingJobs] = useState<AdminJob[]>([]);
//   const [loadingPendingJobs, setLoadingPendingJobs] = useState(false);

//   // Payments
//   const [payments, setPayments] = useState<Payment[]>([]);
//   const [loadingPayments, setLoadingPayments] = useState(false);
//   const [paymentFilter, setPaymentFilter] = useState('all');
//   const [paymentSearch, setPaymentSearch] = useState('');

//   // ── Fetch Functions ──────────────────────────────────────────
//   const fetchJobs = async () => {
//     try {
//       const res = await fetch(`${API_URL}/api/jobs`);
//       const data = await res.json();
//       setJobs(data.jobs || []);
//     } catch (err) { console.error(err); }
//   };

//   const fetchCandidates = async () => {
//     try {
//       setLoadingCandidates(true);
//       const res = await authFetch('/api/admin/profiles');
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'Failed');
//       setCandidates((data.profiles || []).map((p: any) => ({
//         id: p._id,
//         userId: p.userId,
//         fullName: p.personal?.fullName || '',
//         email: p.personal?.email || '',
//         mobile: p.personal?.mobileNumbers || '',
//         skills: p.skills || [],
//         resumeUrl: p.resumeUrl || '#',
//       })));
//     } catch (err: any) {
//       toast.error(err.message);
//     } finally {
//       setLoadingCandidates(false);
//     }
//   };

//   const fetchEmployers = async () => {
//     try {
//       setLoadingEmployers(true);
//       const q = employerFilter !== 'all' ? `?status=${employerFilter}` : '';
//       const res = await authFetch(`/api/admin/employers${q}`);
//       const data = await res.json();
//       setEmployers(data.employers || []);
//     } catch { toast.error('Failed to load employers'); }
//     finally { setLoadingEmployers(false); }
//   };

//   const fetchPendingJobs = async () => {
//     try {
//       setLoadingPendingJobs(true);
//       const res = await authFetch('/api/admin/jobs/pending');
//       const data = await res.json();
//       setPendingJobs(data.jobs || []);
//     } catch { toast.error('Failed to load pending jobs'); }
//     finally { setLoadingPendingJobs(false); }
//   };

//   const fetchPayments = async () => {
//     try {
//       setLoadingPayments(true);
//       const q = paymentFilter !== 'all' ? `?status=${paymentFilter}` : '';
//       const res = await authFetch(`/api/admin/payments${q}`);
//       const data = await res.json();
//       setPayments(data.payments || []);
//     } catch { toast.error('Failed to load payments'); }
//     finally { setLoadingPayments(false); }
//   };

//   useEffect(() => { fetchJobs(); fetchCandidates(); }, []);
//   useEffect(() => { if (activeTab === 'employers') fetchEmployers(); }, [activeTab, employerFilter]);
//   useEffect(() => { if (activeTab === 'pendingJobs') fetchPendingJobs(); }, [activeTab]);
//   useEffect(() => { if (activeTab === 'payments') fetchPayments(); }, [activeTab, paymentFilter]);

//   // ── Employer Actions ─────────────────────────────────────────
//   const handleApproveEmployer = async (id: string) => {
//     try {
//       const res = await authFetch(`/api/admin/employers/${id}/approve`, { method: 'PATCH' });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);
//       toast.success('Employer approved! Email sent.');
//       fetchEmployers();
//     } catch (err: any) { toast.error(err.message); }
//   };

//   const handleBlockEmployer = async (id: string, block: boolean) => {
//     try {
//       const res = await authFetch(`/api/admin/employers/${id}/block`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ block }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);
//       toast.success(`Employer ${block ? 'blocked' : 'unblocked'}.`);
//       fetchEmployers();
//     } catch (err: any) { toast.error(err.message); }
//   };

//   const handleVerifyEmployer = async (id: string) => {
//     try {
//       const res = await authFetch(`/api/admin/employers/${id}/verify`, { method: 'PATCH' });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);
//       toast.success('Verified badge granted!');
//       fetchEmployers();
//     } catch (err: any) { toast.error(err.message); }
//   };

//   const handleSetPlan = async () => {
//     if (!planModal) return;
//     try {
//       const res = await authFetch(`/api/admin/employers/${planModal.employerId}/set-plan`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ plan: manualPlan }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);
//       toast.success(`${manualPlan.toUpperCase()} plan assigned to ${planModal.companyName}`);
//       setPlanModal(null);
//       fetchEmployers();
//     } catch (err: any) { toast.error(err.message); }
//   };

//   // ── Job Approval Actions ─────────────────────────────────────
//   const handleApproveJob = async (id: string) => {
//     try {
//       const res = await authFetch(`/api/admin/jobs/${id}/approve`, { method: 'PATCH' });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);
//       toast.success('✅ Job approved! Employer notified by email.');
//       fetchPendingJobs();
//       fetchJobs();
//     } catch (err: any) { toast.error(err.message); }
//   };

//   const handleRejectJob = async (id: string, reason: string = '') => {
//     try {
//       const res = await authFetch(`/api/admin/jobs/${id}/reject`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ reason }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);
//       toast.success('Job rejected. Employer notified.');
//       fetchPendingJobs();
//       fetchJobs();
//     } catch (err: any) { toast.error(err.message); }
//   };

//   // ── Candidate Actions ────────────────────────────────────────
//   const downloadResume = async (id: string) => {
//     try {
//       const res = await authFetch(`/api/admin/download-resume/${id}`);
//       if (!res.ok) throw new Error('Failed to download');
//       const blob = await res.blob();
//       const contentDisposition = res.headers.get('content-disposition');
//       let fileName = 'resume.pdf';
//       if (contentDisposition) {
//         const match = contentDisposition.match(/filename="?(.+)"?/);
//         if (match?.[1]) fileName = match[1];
//       }
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url; link.download = fileName;
//       document.body.appendChild(link); link.click();
//       link.remove(); window.URL.revokeObjectURL(url);
//     } catch (err: any) { toast.error(err.message); }
//   };

//   const handleViewResume = async (id: string) => {
//     try {
//       const res = await authFetch(`/api/admin/download-resume/${id}`);
//       if (!res.ok) throw new Error('Failed to load');
//       const blob = await res.blob();
//       setPreviewUrl(URL.createObjectURL(blob));
//     } catch (err: any) { toast.error(err.message); }
//   };

//   const deleteCandidate = async (id: string) => {
//     try {
//       const res = await authFetch(`/api/admin/profile/${id}`, { method: 'DELETE' });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);
//       toast.success('Candidate deleted');
//       setCandidates((prev) => prev.filter((c) => c.id !== id));
//       setDeleteCandidateId(null);
//     } catch (err: any) { toast.error(err.message); }
//   };

//   // ── Admin Job CRUD ───────────────────────────────────────────
//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => setFormData({ ...formData, [e.target.name]: e.target.value });

//   const openJobModal = (job?: AdminJob) => {
//     if (job) {
//       setEditingJob(job);
//       setFormData({
//         title: job.title,
//         company: job.company || '',
//         location: job.location,
//         experience: job.experience || job.experienceRequired || '',
//         qualification: job.qualification || '',
//         description: job.description,
//         requirements: (job.requirements || job.keySkills || []).join(', '),
//         salary: job.salary || '',
//         jobType: job.jobType || job.employmentType || 'Full-time',
//       });
//     } else {
//       setEditingJob(null);
//       setFormData({
//         title: '', company: '', location: '', experience: '',
//         qualification: '', description: '', requirements: '',
//         salary: '', jobType: 'Full-time',
//       });
//     }
//     setShowJobModal(true);
//   };

//   const handleSubmitJob = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const url = editingJob
//         ? `${API_URL}/api/jobs/${editingJob._id}`
//         : `${API_URL}/api/jobs`;
//       const method = editingJob ? 'PUT' : 'POST';
//       const res = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ...formData,
//           requirements: formData.requirements.split(',').map((r) => r.trim()).filter(Boolean),
//           postedBy: 'admin',
//           status: 'Active',
//           isAdminApproved: true,
//         }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'Failed');
//       toast.success(editingJob ? 'Job updated!' : 'Job posted successfully!');
//       setShowJobModal(false);
//       fetchJobs();
//     } catch (error: any) { toast.error(error.message); }
//   };

//   const handleDeleteJob = async (_id: string) => {
//     if (!window.confirm('Delete this job? This cannot be undone.')) return;
//     try {
//       const res = await fetch(`${API_URL}/api/jobs/${_id}`, { method: 'DELETE' });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);
//       toast.success('Job deleted');
//       fetchJobs();
//     } catch (error: any) { toast.error(error.message); }
//   };

//   // ── Payment helpers ──────────────────────────────────────────
//   const filteredPayments = payments.filter((p) => {
//     if (!paymentSearch) return true;
//     const q = paymentSearch.toLowerCase();
//     return (
//       p.employer?.companyName?.toLowerCase().includes(q) ||
//       p.employer?.email?.toLowerCase().includes(q) ||
//       p.plan?.toLowerCase().includes(q) ||
//       p.razorpayPaymentId?.toLowerCase().includes(q)
//     );
//   });

//   const paymentStats = {
//     total: payments.length,
//     success: payments.filter(p => p.status === 'success').length,
//     pending: payments.filter(p => p.status === 'pending').length,
//     failed: payments.filter(p => p.status === 'failed').length,
//     revenue: payments.filter(p => p.status === 'success').reduce((s, p) => s + p.amount, 0),
//   };

//   // ── Tab config ───────────────────────────────────────────────
//   const tabs = [
//     { key: 'jobs', label: 'All Jobs', icon: <Briefcase className="h-4 w-4" /> },
//     {
//       key: 'pendingJobs',
//       label: `Approvals${pendingJobs.length ? ` (${pendingJobs.length})` : ''}`,
//       icon: <CheckCircle className="h-4 w-4" />,
//     },
//     { key: 'candidates', label: 'Candidates', icon: <Users className="h-4 w-4" /> },
//     { key: 'employers', label: 'Employers', icon: <Building2 className="h-4 w-4" /> },
//     { key: 'payments', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">

//           {/* Header */}
//           <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10 text-white">
//             <h1 className="text-3xl font-bold">Admin Panel</h1>
//             <p className="text-blue-100 mt-1">
//               Manage jobs, approve employer posts, manage candidates, employers and payments
//             </p>
//             <div className="flex flex-wrap gap-4 mt-4">
//               {[
//                 { label: 'Total Jobs', value: jobs.length },
//                 { label: 'Pending Approvals', value: pendingJobs.length },
//                 { label: 'Candidates', value: candidates.length },
//                 { label: 'Employers', value: employers.length },
//               ].map((s) => (
//                 <div key={s.label} className="bg-white/10 rounded-xl px-4 py-2 text-center">
//                   <p className="text-xl font-bold">{s.value}</p>
//                   <p className="text-xs text-blue-100">{s.label}</p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Tabs */}
//           <div className="border-b border-gray-200 overflow-x-auto">
//             <div className="flex px-6 min-w-max">
//               {tabs.map((tab) => (
//                 <button
//                   key={tab.key}
//                   onClick={() => setActiveTab(tab.key as any)}
//                   className={`py-4 px-5 font-semibold transition-colors border-b-2 flex items-center gap-2 text-sm whitespace-nowrap ${
//                     activeTab === tab.key
//                       ? 'text-blue-600 border-blue-600'
//                       : 'text-gray-500 border-transparent hover:text-blue-500'
//                   }`}
//                 >
//                   {tab.icon}
//                   {tab.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="p-6 sm:p-8">

//             {/* ── ALL JOBS TAB ─────────────────────────────────── */}
//             {activeTab === 'jobs' && (
//               <div>
//                 <div className="flex justify-between items-center mb-6">
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-800">All Job Listings</h2>
//                     <p className="text-sm text-gray-500 mt-0.5">{jobs.length} total jobs</p>
//                   </div>
//                   <button
//                     onClick={() => openJobModal()}
//                     className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 text-sm"
//                   >
//                     <Plus className="h-4 w-4" /> Post New Job
//                   </button>
//                 </div>

//                 <div className="space-y-3">
//                   {jobs.length === 0 ? (
//                     <p className="text-center text-gray-400 py-12">No jobs posted yet.</p>
//                   ) : (
//                     jobs.map((job) => (
//                       <div key={job._id} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition">
//                         <div className="flex justify-between items-start gap-4">
//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center gap-2 flex-wrap mb-1.5">
//                               <h3 className="font-bold text-gray-800">{job.title}</h3>

//                               {/* Who posted */}
//                               <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
//                                 job.postedBy === 'employer'
//                                   ? 'bg-purple-100 text-purple-700'
//                                   : 'bg-blue-100 text-blue-700'
//                               }`}>
//                                 {job.postedBy === 'employer' ? '🏢 Employer' : '👤 Admin'}
//                               </span>

//                               {/* Approval status */}
//                               {job.postedBy === 'employer' ? (
//                                 <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
//                                   job.status === 'approved' ? 'bg-green-100 text-green-700' :
//                                   job.status === 'rejected' ? 'bg-red-100 text-red-700' :
//                                   'bg-yellow-100 text-yellow-700'
//                                 }`}>
//                                   {job.status === 'approved' ? '✅ Approved' :
//                                    job.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
//                                 </span>
//                               ) : (
//                                 <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
//                                   ✅ Live
//                                 </span>
//                               )}
//                             </div>

//                             <p className="text-blue-600 font-medium text-sm mb-2">
//                               {job.employer?.companyName || job.company || '—'}
//                             </p>

//                             <div className="grid sm:grid-cols-3 gap-2 text-xs text-gray-500">
//                               <span>📍 {job.location}</span>
//                               <span>💼 {job.experience || job.experienceRequired || '—'}</span>
//                               <span>💰 {job.salary || (job.salaryMin ? `₹${(job.salaryMin/100000).toFixed(1)}L` : '—')}</span>
//                             </div>
//                           </div>

//                           <div className="flex gap-2 flex-shrink-0">
//                             <button
//                               onClick={() => openJobModal(job)}
//                               className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
//                               title="Edit"
//                             >
//                               <Edit className="h-5 w-5" />
//                             </button>
//                             <button
//                               onClick={() => handleDeleteJob(job._id)}
//                               className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
//                               title="Delete"
//                             >
//                               <Trash2 className="h-5 w-5" />
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* ── PENDING APPROVALS TAB ────────────────────────── */}
//             {activeTab === 'pendingJobs' && (
//               <div>
//                 <div className="flex justify-between items-center mb-4">
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-800">Pending Job Approvals</h2>
//                     <p className="text-sm text-gray-500 mt-0.5">
//                       Review and approve employer-submitted jobs before they go live
//                     </p>
//                   </div>
//                   <button
//                     onClick={fetchPendingJobs}
//                     className="text-sm text-blue-600 hover:underline flex items-center gap-1"
//                   >
//                     🔄 Refresh
//                   </button>
//                 </div>

//                 {/* Info banner */}
//                 <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
//                   ℹ️ Only <strong>employer-submitted</strong> jobs appear here.
//                   Admin-posted jobs are automatically live and do not need approval.
//                 </div>

//                 {loadingPendingJobs ? (
//                   <div className="flex justify-center py-12">
//                     <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
//                   </div>
//                 ) : pendingJobs.length === 0 ? (
//                   <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
//                     <CheckCircle className="h-14 w-14 text-green-400 mx-auto mb-4" />
//                     <p className="text-gray-600 font-semibold text-lg">All caught up!</p>
//                     <p className="text-sm text-gray-400 mt-1">No pending employer jobs to review.</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {pendingJobs.map((job) => (
//                       <JobApprovalCard
//                         key={job._id}
//                         job={job}
//                         onApprove={handleApproveJob}
//                         onReject={handleRejectJob}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* ── CANDIDATES TAB ───────────────────────────────── */}
//             {activeTab === 'candidates' && (
//               <div>
//                 <div className="flex justify-between items-center mb-6">
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-800">Registered Candidates</h2>
//                     <p className="text-sm text-gray-500">Total: {candidates.length}</p>
//                   </div>
//                 </div>
//                 {loadingCandidates ? (
//                   <div className="flex justify-center py-16">
//                     <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-400" />
//                   </div>
//                 ) : candidates.length === 0 ? (
//                   <p className="text-center text-gray-400 py-12">No candidates registered yet.</p>
//                 ) : (
//                   <div className="overflow-x-auto rounded-xl border border-gray-200">
//                     <table className="w-full">
//                       <thead>
//                         <tr className="bg-gray-50 border-b border-gray-200">
//                           {['Name', 'Email', 'Mobile', 'Skills', 'Actions'].map(h => (
//                             <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
//                               {h}
//                             </th>
//                           ))}
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-100">
//                         {candidates.map((candidate) => (
//                           <tr key={candidate.id} className="hover:bg-gray-50 transition">
//                             <td className="px-5 py-4 text-sm font-medium text-gray-800">
//                               {candidate.fullName}
//                             </td>
//                             <td className="px-5 py-4 text-sm text-gray-600">{candidate.email}</td>
//                             <td className="px-5 py-4 text-sm text-gray-600">{candidate.mobile}</td>
//                             <td className="px-5 py-4">
//                               <div className="flex flex-wrap gap-1">
//                                 {candidate.skills.slice(0, 3).map((skill) => (
//                                   <span key={skill} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
//                                     {skill}
//                                   </span>
//                                 ))}
//                                 {candidate.skills.length > 3 && (
//                                   <span className="text-gray-400 text-xs">+{candidate.skills.length - 3}</span>
//                                 )}
//                               </div>
//                             </td>
//                             <td className="px-5 py-4">
//                               <div className="flex items-center gap-3">
//                                 <button
//                                   onClick={() => handleViewResume(candidate.id)}
//                                   className="text-green-600 hover:text-green-700 text-xs font-medium"
//                                 >
//                                   View
//                                 </button>
//                                 <button
//                                   onClick={() => downloadResume(candidate.id)}
//                                   className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
//                                 >
//                                   <Download className="h-3.5 w-3.5" /> Download
//                                 </button>
//                                 <button
//                                   onClick={() => setDeleteCandidateId(candidate.id)}
//                                   className="flex items-center gap-1 text-red-500 hover:text-red-600 text-xs font-medium"
//                                 >
//                                   <Trash2 className="h-3.5 w-3.5" /> Delete
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* ── EMPLOYERS TAB ────────────────────────────────── */}
//             {activeTab === 'employers' && (
//               <div>
//                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-800">Employer Accounts</h2>
//                     <p className="text-sm text-gray-500">{employers.length} employers</p>
//                   </div>
//                   <div className="flex gap-2 flex-wrap">
//                     {['all', 'pending', 'approved', 'blocked'].map((f) => (
//                       <button
//                         key={f}
//                         onClick={() => setEmployerFilter(f)}
//                         className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
//                           employerFilter === f
//                             ? 'bg-blue-600 text-white border-blue-600'
//                             : 'border-gray-300 text-gray-600 hover:bg-gray-50'
//                         }`}
//                       >
//                         {f.charAt(0).toUpperCase() + f.slice(1)}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {loadingEmployers ? (
//                   <div className="flex justify-center py-12">
//                     <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
//                   </div>
//                 ) : employers.length === 0 ? (
//                   <p className="text-center text-gray-400 py-12">No employers found.</p>
//                 ) : (
//                   <div className="space-y-3">
//                     {employers.map((emp) => (
//                       <div key={emp._id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
//                         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center gap-2 flex-wrap mb-1">
//                               <h3 className="font-bold text-gray-900">{emp.companyName}</h3>
//                               {emp.isVerified && (
//                                 <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">✓ Verified</span>
//                               )}
//                               {emp.isBlocked && (
//                                 <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">🚫 Blocked</span>
//                               )}
//                               {!emp.isApproved && !emp.isBlocked && (
//                                 <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">⏳ Pending</span>
//                               )}
//                               {emp.isApproved && !emp.isBlocked && (
//                                 <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✅ Approved</span>
//                               )}
//                             </div>
//                             <p className="text-sm text-gray-600 mb-1">
//                               {emp.recruiterName} · {emp.email}
//                             </p>
//                             <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
//                               <span>📍 {emp.companyLocation}</span>
//                               <span>📱 {emp.mobile}</span>
//                               <span>💳 {emp.subscription?.plan || 'none'}</span>
//                               {emp.subscription?.expiresAt && (
//                                 <span>Expires: {new Date(emp.subscription.expiresAt).toLocaleDateString('en-IN')}</span>
//                               )}
//                               <span>📅 {new Date(emp.createdAt).toLocaleDateString('en-IN')}</span>
//                             </div>
//                           </div>

//                           <div className="flex flex-wrap gap-2">
//                             {!emp.isApproved && !emp.isBlocked && (
//                               <button
//                                 onClick={() => handleApproveEmployer(emp._id)}
//                                 className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
//                               >
//                                 ✅ Approve
//                               </button>
//                             )}
//                             {emp.isApproved && !emp.isVerified && (
//                               <button
//                                 onClick={() => handleVerifyEmployer(emp._id)}
//                                 className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 font-medium"
//                               >
//                                 🏅 Verify
//                               </button>
//                             )}
//                             <button
//                               onClick={() => setPlanModal({ employerId: emp._id, companyName: emp.companyName })}
//                               className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 font-medium"
//                             >
//                               🎁 Plan
//                             </button>
//                             <button
//                               onClick={() => handleBlockEmployer(emp._id, !emp.isBlocked)}
//                               className={`text-xs px-3 py-1.5 border rounded-lg font-medium ${
//                                 emp.isBlocked
//                                   ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
//                                   : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
//                               }`}
//                             >
//                               {emp.isBlocked ? '🔓 Unblock' : '🚫 Block'}
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* ── PAYMENTS TAB ─────────────────────────────────── */}
//             {activeTab === 'payments' && (
//               <div>
//                 <div className="flex justify-between items-center mb-6">
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-800">Payment Records</h2>
//                     <p className="text-sm text-gray-500">{payments.length} transactions</p>
//                   </div>
//                   <button onClick={fetchPayments} className="text-sm text-blue-600 hover:underline">
//                     🔄 Refresh
//                   </button>
//                 </div>

//                 {/* Stats */}
//                 <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
//                   {[
//                     { label: 'Total', value: paymentStats.total, color: 'bg-gray-100 text-gray-800' },
//                     { label: 'Successful', value: paymentStats.success, color: 'bg-green-100 text-green-800' },
//                     { label: 'Pending', value: paymentStats.pending, color: 'bg-yellow-100 text-yellow-800' },
//                     { label: 'Failed', value: paymentStats.failed, color: 'bg-red-100 text-red-800' },
//                     { label: 'Revenue', value: `₹${paymentStats.revenue.toLocaleString('en-IN')}`, color: 'bg-blue-100 text-blue-800' },
//                   ].map((stat) => (
//                     <div key={stat.label} className={`${stat.color} rounded-xl p-3 text-center`}>
//                       <p className="text-lg font-bold">{stat.value}</p>
//                       <p className="text-xs font-medium mt-0.5">{stat.label}</p>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Filters */}
//                 <div className="flex flex-wrap gap-3 mb-5">
//                   <div className="flex gap-2 flex-wrap">
//                     {['all', 'success', 'pending', 'failed'].map((f) => (
//                       <button
//                         key={f}
//                         onClick={() => setPaymentFilter(f)}
//                         className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
//                           paymentFilter === f
//                             ? 'bg-blue-600 text-white border-blue-600'
//                             : 'border-gray-300 text-gray-600 hover:bg-gray-50'
//                         }`}
//                       >
//                         {f.charAt(0).toUpperCase() + f.slice(1)}
//                       </button>
//                     ))}
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search by company, email, plan, payment ID..."
//                     value={paymentSearch}
//                     onChange={(e) => setPaymentSearch(e.target.value)}
//                     className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>

//                 {loadingPayments ? (
//                   <div className="flex justify-center py-12">
//                     <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
//                   </div>
//                 ) : filteredPayments.length === 0 ? (
//                   <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
//                     <CreditCard className="h-10 w-10 text-gray-300 mx-auto mb-3" />
//                     <p className="text-gray-400">No payment records found.</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     {filteredPayments.map((p) => (
//                       <div
//                         key={p._id}
//                         className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
//                       >
//                         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-2 flex-wrap mb-1">
//                               <h3 className="font-bold text-gray-900">{p.employer?.companyName || 'Unknown'}</h3>
//                               <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
//                                 p.plan === 'premium' ? 'bg-purple-100 text-purple-700' :
//                                 p.plan === 'standard' ? 'bg-blue-100 text-blue-700' :
//                                 'bg-gray-100 text-gray-700'
//                               }`}>
//                                 {p.plan} Plan
//                               </span>
//                             </div>
//                             <p className="text-sm text-gray-600 mb-1">
//                               {p.employer?.recruiterName} · {p.employer?.email}
//                             </p>
//                             <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
//                               <span className="font-semibold text-gray-700">₹{p.amount.toLocaleString('en-IN')}</span>
//                               <span>{new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
//                               <span>Credits: {p.jobCredits === 99999 ? '∞' : p.jobCredits}</span>
//                               <span>Validity: {p.validityDays} days</span>
//                               {p.razorpayPaymentId && (
//                                 <span className="font-mono">ID: {p.razorpayPaymentId}</span>
//                               )}
//                             </div>
//                           </div>
//                           <span className={`text-xs px-3 py-1.5 rounded-full font-semibold flex-shrink-0 ${
//                             p.status === 'success' ? 'bg-green-100 text-green-700' :
//                             p.status === 'failed' ? 'bg-red-100 text-red-700' :
//                             'bg-yellow-100 text-yellow-700'
//                           }`}>
//                             {p.status === 'success' ? '✅ Paid' : p.status === 'failed' ? '❌ Failed' : '⏳ Pending'}
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}

//           </div>
//         </div>
//       </div>

//       {/* ── Delete Candidate Modal ── */}
//       {deleteCandidateId && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
//             <h2 className="text-lg font-bold text-gray-800 mb-2">Confirm Delete</h2>
//             <p className="text-gray-600 text-sm mb-5">
//               Are you sure you want to delete this candidate? This cannot be undone.
//             </p>
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setDeleteCandidateId(null)}
//                 className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => deleteCandidate(deleteCandidateId)}
//                 className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Resume Preview Modal ── */}
//       {previewUrl && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl w-full max-w-4xl h-[90vh] relative">
//             <button
//               onClick={() => setPreviewUrl(null)}
//               className="absolute top-3 right-3 text-gray-500 hover:text-black z-10 bg-white rounded-full p-1 shadow"
//             >
//               <X className="h-5 w-5" />
//             </button>
//             <iframe src={previewUrl} className="w-full h-full rounded-xl" title="Resume Preview" />
//           </div>
//         </div>
//       )}

//       {/* ── Set Plan Modal ── */}
//       {planModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
//             <h2 className="text-lg font-bold text-gray-800 mb-1">Assign Subscription Plan</h2>
//             <p className="text-sm text-gray-500 mb-4">{planModal.companyName}</p>
//             <div className="space-y-2.5 mb-6">
//               {[
//                 { value: 'none', label: 'No Plan', desc: 'Remove subscription' },
//                 { value: 'basic', label: 'Basic', desc: '5 jobs / 30 days' },
//                 { value: 'standard', label: 'Standard', desc: '15 jobs / 60 days' },
//                 { value: 'premium', label: 'Premium', desc: 'Unlimited / 90 days' },
//               ].map((p) => (
//                 <label key={p.value} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition ${
//                   manualPlan === p.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
//                 }`}>
//                   <input
//                     type="radio" name="plan" value={p.value}
//                     checked={manualPlan === p.value}
//                     onChange={() => setManualPlan(p.value)}
//                     className="accent-blue-600"
//                   />
//                   <div>
//                     <p className="text-sm font-semibold text-gray-800">{p.label}</p>
//                     <p className="text-xs text-gray-500">{p.desc}</p>
//                   </div>
//                 </label>
//               ))}
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setPlanModal(null)}
//                 className="flex-1 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-semibold"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSetPlan}
//                 className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
//               >
//                 Assign Plan
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Add/Edit Admin Job Modal ── */}
//       {showJobModal && (
//         <div
//           className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
//           onClick={() => setShowJobModal(false)}
//         >
//           <div
//             className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex justify-between items-center mb-5">
//               <h2 className="text-xl font-bold text-gray-800">
//                 {editingJob ? 'Edit Job' : 'Post New Job (Admin)'}
//               </h2>
//               <button onClick={() => setShowJobModal(false)} className="text-gray-400 hover:text-gray-600">
//                 <X className="h-6 w-6" />
//               </button>
//             </div>

//             {!editingJob && (
//               <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
//                 ℹ️ Jobs posted by admin are automatically approved and immediately visible on Browse Jobs.
//               </div>
//             )}

//             <form onSubmit={handleSubmitJob} className="space-y-4">
//               <div className="grid md:grid-cols-2 gap-4">
//                 {[
//                   { name: 'title', label: 'Job Title *', placeholder: 'e.g. Senior Frontend Developer', required: true, colSpan: 2 },
//                   { name: 'company', label: 'Company Name *', placeholder: 'e.g. Tech Solutions', required: true, colSpan: 1 },
//                   { name: 'location', label: 'Location *', placeholder: 'e.g. Mumbai', required: true, colSpan: 1 },
//                   { name: 'experience', label: 'Experience', placeholder: 'e.g. 2-4 years', required: false, colSpan: 1 },
//                   { name: 'salary', label: 'Salary', placeholder: 'e.g. ₹8-12 LPA', required: false, colSpan: 1 },
//                   { name: 'qualification', label: 'Qualification', placeholder: 'e.g. B.Tech / Any Graduate', required: false, colSpan: 2 },
//                 ].map((f) => (
//                   <div key={f.name} className={f.colSpan === 2 ? 'md:col-span-2' : ''}>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
//                     <input
//                       type="text" name={f.name}
//                       value={(formData as any)[f.name]}
//                       onChange={handleChange}
//                       required={f.required}
//                       placeholder={f.placeholder}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                 ))}

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
//                   <select
//                     name="jobType" value={formData.jobType} onChange={handleChange}
//                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option>Full-time</option>
//                     <option>Part-time</option>
//                     <option>Contract</option>
//                     <option>Internship</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills (comma-separated)</label>
//                   <input
//                     type="text" name="requirements" value={formData.requirements}
//                     onChange={handleChange} required
//                     placeholder="e.g. React, Node.js, MongoDB"
//                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
//                   <textarea
//                     name="description" value={formData.description}
//                     onChange={handleChange} required rows={4}
//                     placeholder="Describe the role, responsibilities, and requirements..."
//                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//                   />
//                 </div>
//               </div>

//               <div className="flex gap-4 pt-2">
//                 <button
//                   type="submit"
//                   className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold text-sm"
//                 >
//                   {editingJob ? 'Update Job' : '🚀 Post Job (Auto-Approved)'}
//                 </button>
//                 <button
//                   type="button" onClick={() => setShowJobModal(false)}
//                   className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-semibold text-sm"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }