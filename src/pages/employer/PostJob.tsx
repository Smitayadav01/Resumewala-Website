import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createJob, updateJob, getJobById } from "../../services/employerApi";
import toast from "react-hot-toast";

const INITIAL_FORM = {
  title: "", location: "", experienceRequired: "", industryCategory: "",
  employmentType: "", workMode: "", description: "", keySkills: "",
  numberOfOpenings: 1, expiryDate: "",
  salaryMin: "", salaryMax: "", educationQualification: "", interviewProcess: "", agePreference: "",
  status: "Draft",
};

const EMPLOYMENT_TYPES = ["Full Time", "Part Time", "Contract"];
const WORK_MODES = ["Onsite", "Hybrid", "Remote"];
const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Education", "Manufacturing", "Retail", "Media", "Consulting", "Real Estate", "Other"];

export default function PostJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    getJobById(id!)
      .then((job) => {
        setForm({
          ...job,
          keySkills: Array.isArray(job.keySkills) ? job.keySkills.join(", ") : "",
          expiryDate: job.expiryDate ? new Date(job.expiryDate).toISOString().split("T")[0] : "",
          salaryMin: job.salaryMin ?? "",
          salaryMax: job.salaryMax ?? "",
        });
      })
      .catch(() => toast.error("Failed to load job."))
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

 const handleSave = async (status: "pending" | "Draft") => {
  if (!form.title || !form.location || !form.description || !form.employmentType || !form.workMode) {
    toast.error("Please fill all required fields.");
    return;
  }
  setLoading(true);
  try {
    const payload = {
      ...form,
      status,
      keySkills: form.keySkills.split(",").map((s) => s.trim()).filter(Boolean),
      numberOfOpenings: Number(form.numberOfOpenings),
      salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
    };

    if (isEdit) {
      await updateJob(id!, payload);
      toast.success("Job updated successfully!");
    } else {
      const data = await createJob(payload);

      if (status === "pending") {
        const isFree = data.isFreePost;
        const remaining = data.creditsRemaining;

        if (isFree) {
          toast.success(
            `✅ Job submitted for approval! ${remaining} free post${remaining !== 1 ? "s" : ""} remaining.`,
            { duration: 5000 }
          );
        } else {
          toast.success("✅ Job submitted for admin approval!");
        }
      } else {
        toast.success("Draft saved successfully.");
      }
    }
    navigate("/employer/jobs");
  } catch (err: any) {
    const msg = err.response?.data?.message || "Failed to save job.";
    const requiresPlan = err.response?.data?.requiresPlan;

    if (requiresPlan) {
      toast.error(msg, { duration: 6000 });
      // Redirect to plans after short delay
      setTimeout(() => navigate("/employer/plans"), 2000);
    } else {
      toast.error(msg);
    }
  } finally {
    setLoading(false);
  }
};

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{isEdit ? "Edit Job" : "Post a New Job"}</h1>
          <p className="text-sm text-gray-500">Fields marked with * are required</p>
        </div>
        <button onClick={() => navigate("/employer/jobs")} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">

        {/* Mandatory Fields */}
        <div>
          <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b">Job Details *</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "title", label: "Job Title *", type: "text", placeholder: "e.g. Senior React Developer" },
              { name: "location", label: "Job Location *", type: "text", placeholder: "e.g. Mumbai, Maharashtra" },
              { name: "experienceRequired", label: "Experience Required *", type: "text", placeholder: "e.g. 2-4 Years" },
              { name: "numberOfOpenings", label: "Number of Openings *", type: "number", placeholder: "1" },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input
                  type={f.type} name={f.name} placeholder={f.placeholder}
                  value={(form as any)[f.name]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry Category *</label>
              <select name="industryCategory" value={form.industryCategory} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Industry</option>
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type *</label>
              <select name="employmentType" value={form.employmentType} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Type</option>
                {EMPLOYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode *</label>
              <select name="workMode" value={form.workMode} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Mode</option>
                {WORK_MODES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Expiry Date *</label>
              <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Skills * (comma separated)</label>
              <input type="text" name="keySkills" value={form.keySkills} onChange={handleChange}
                placeholder="e.g. React, Node.js, MongoDB, REST APIs"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
              <textarea name="description" rows={5} value={form.description} onChange={handleChange}
                placeholder="Describe the role, responsibilities, and what you are looking for..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
        </div>

        {/* Optional Fields */}
        <div>
          <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b">Optional Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary (₹/year)</label>
              <input type="number" name="salaryMin" value={form.salaryMin} onChange={handleChange}
                placeholder="e.g. 500000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary (₹/year)</label>
              <input type="number" name="salaryMax" value={form.salaryMax} onChange={handleChange}
                placeholder="e.g. 1000000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education Qualification</label>
              <input type="text" name="educationQualification" value={form.educationQualification} onChange={handleChange}
                placeholder="e.g. B.Tech / MCA / Any Graduate"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age Preference</label>
              <input type="text" name="agePreference" value={form.agePreference} onChange={handleChange}
                placeholder="e.g. 21–35 years"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Interview Process</label>
              <input type="text" name="interviewProcess" value={form.interviewProcess} onChange={handleChange}
                placeholder="e.g. Phone Screen → Technical Test → HR Round"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
       <div className="flex flex-col sm:flex-row gap-3 pt-2">
  <button onClick={() => handleSave("Draft")} disabled={loading}
    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-60">
    💾 Save as Draft
  </button>
  <button onClick={() => handleSave("pending")} disabled={loading}
    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-60">
    {loading ? "Submitting..." : "🚀 Submit for Approval"}
  </button>
</div>
      </div>
    </div>
  );
}