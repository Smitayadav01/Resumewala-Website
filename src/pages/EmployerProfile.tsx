import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmployerProfile, updateEmployerProfile } from '../services/employerApi';
import { useEmployerAuth } from '../context/EmployerAuthContext';
import { Camera, Save, ArrowLeft, Globe, Building2, MapPin, CheckCircle } from 'lucide-react';

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
const INDUSTRIES = [
  'Information Technology', 'Finance & Banking', 'Healthcare', 'Education', 'E-commerce',
  'Manufacturing', 'Retail', 'Hospitality & Tourism', 'Real Estate', 'Media & Entertainment',
  'Consulting', 'Legal', 'Logistics & Supply Chain', 'Automobile', 'Agriculture', 'Other',
];

export default function EmployerProfile() {
  const navigate = useNavigate();
  const { refreshEmployer, employer } = useEmployerAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    companyName: '', recruiterName: '', mobile: '', companyLocation: '',
    companyWebsite: '', companyDescription: '', industryType: '', companySize: '',
  });
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    getEmployerProfile()
      .then(res => {
        const e = res.data.employer;
        setForm({
          companyName: e.companyName || '',
          recruiterName: e.recruiterName || '',
          mobile: e.mobile || '',
          companyLocation: e.companyLocation || '',
          companyWebsite: e.companyWebsite || '',
          companyDescription: e.companyDescription || '',
          industryType: e.industryType || '',
          companySize: e.companySize || '',
        });
        setLogoPreview(e.companyLogo || '');
        setCompletion(e.profileCompletionPercent || 0);
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (logoFile) fd.append('companyLogo', logoFile);
      await updateEmployerProfile(fd);
      await refreshEmployer();
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/employer/dashboard')} className="p-2 rounded-lg hover:bg-gray-200 transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Company Profile</h1>
            <p className="text-sm text-gray-500">This info appears on your job listings</p>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Profile Completion</span>
            <span className="text-sm font-bold text-blue-600">{completion}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${completion}%` }} />
          </div>
          {employer?.isVerifiedBadge && (
            <div className="flex items-center gap-2 mt-3 text-sm text-blue-700">
              <CheckCircle className="w-4 h-4" /> Verified Employer Badge Active
            </div>
          )}
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-5 text-green-700 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
            {/* Logo Upload */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-xl border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Company Logo</p>
                <p className="text-xs text-gray-500 mt-0.5">PNG, JPG up to 5MB. Recommended: 200×200px</p>
                <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-blue-600 hover:underline mt-1">
                  {logoPreview ? 'Change logo' : 'Upload logo'}
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Company Name *">
                  <input name="companyName" value={form.companyName} onChange={handleChange} required className="input-field" />
                </Field>
                <Field label="Recruiter Name *">
                  <input name="recruiterName" value={form.recruiterName} onChange={handleChange} required className="input-field" />
                </Field>
                <Field label="Mobile Number *">
                  <input name="mobile" value={form.mobile} onChange={handleChange} required className="input-field" />
                </Field>
                <Field label="Company Location *">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input name="companyLocation" value={form.companyLocation} onChange={handleChange} required
                      className="input-field pl-9" />
                  </div>
                </Field>
                <Field label="Industry Type">
                  <select name="industryType" value={form.industryType} onChange={handleChange} className="input-field">
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </Field>
                <Field label="Company Size">
                  <select name="companySize" value={form.companySize} onChange={handleChange} className="input-field">
                    <option value="">Select size</option>
                    {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                  </select>
                </Field>
                <div className="md:col-span-2">
                  <Field label="Company Website">
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input name="companyWebsite" value={form.companyWebsite} onChange={handleChange}
                        placeholder="https://yourcompany.com" className="input-field pl-9" />
                    </div>
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Company Description">
                    <textarea name="companyDescription" value={form.companyDescription} onChange={handleChange} rows={4}
                      placeholder="Tell candidates about your company, culture, and values..."
                      className="input-field resize-none" />
                  </Field>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition disabled:opacity-60">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`.input-field { width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: all .15s; background: white; } .input-field:focus { border-color: transparent; box-shadow: 0 0 0 2px #3b82f6; }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>{children}</div>;
}