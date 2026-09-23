import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { updateEmployerProfile, uploadEmployerLogo } from "../../services/employerApi";
import { useEmployer } from "../../context/EmployerContext";
import toast from "react-hot-toast";

const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"];
const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Education", "Manufacturing", "Retail", "Media", "Consulting", "Real Estate", "Other"];

export default function EmployerProfile() {
  const { employer, refreshEmployer } = useEmployer();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);

  const [form, setForm] = useState({
    companyName: "", recruiterName: "", mobile: "", companyLocation: "",
    companyWebsite: "", companyDescription: "", industryType: "", companySize: "",
  });

  useEffect(() => {
  // Refresh from server every time profile page loads
  refreshEmployer();
}, []);

useEffect(() => {
  if (employer) {
    setForm({
      companyName: employer.companyName || "",
      recruiterName: employer.recruiterName || "",
      mobile: (employer as any).mobile || "",
      companyLocation: (employer as any).companyLocation || "",
      companyWebsite: (employer as any).companyWebsite || "",
      companyDescription: (employer as any).companyDescription || "",
      industryType: (employer as any).industryType || "",
      companySize: (employer as any).companySize || "",
    });
  }
}, [employer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    await updateEmployerProfile(form);
    await refreshEmployer();

    toast.success("Profile updated successfully!");

    // Redirect to employer dashboard
    navigate("/employer/dashboard");
  } catch {
    toast.error("Failed to update profile.");
  } finally {
    setLoading(false);
  }
};

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append("logo", e.target.files[0]);
    setLogoLoading(true);
    try {
      await uploadEmployerLogo(formData);
      await refreshEmployer();
      toast.success("Logo updated!");
    } catch {
      toast.error("Failed to upload logo.");
    } finally {
      setLogoLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Company Profile</h1>

      {/* Logo Upload */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Company Logo</h2>
        <div className="flex items-center gap-6">
          <div
            className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-400 transition"
            onClick={() => fileRef.current?.click()}
          >
            {employer?.companyLogo ? (
              <img src={employer.companyLogo} alt="logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">🏢</span>
            )}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            <button
              onClick={() => fileRef.current?.click()} disabled={logoLoading}
              className="text-sm bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-100 font-medium disabled:opacity-50"
            >
              {logoLoading ? "Uploading..." : "Upload Logo"}
            </button>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB. Recommended: 300×300px</p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b">Company Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { name: "companyName", label: "Company Name *", type: "text" },
            { name: "recruiterName", label: "Recruiter Name *", type: "text" },
            { name: "mobile", label: "Mobile Number", type: "tel" },
            { name: "companyLocation", label: "Company Location *", type: "text" },
            { name: "companyWebsite", label: "Website", type: "url" },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input
                type={f.type} name={f.name}
                value={(form as any)[f.name]}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry Type</label>
            <select name="industryType" value={form.industryType} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select Industry</option>
              {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
            <select name="companySize" value={form.companySize} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select Size</option>
              {COMPANY_SIZES.map((s) => <option key={s}>{s} employees</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
            <textarea name="companyDescription" rows={4} value={form.companyDescription} onChange={handleChange}
              placeholder="Tell candidates about your company, culture, and values..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition disabled:opacity-60">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}