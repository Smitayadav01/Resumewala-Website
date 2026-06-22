import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createJob, getJobById, updateJob } from '../services/employerApi';
import { ArrowLeft, Plus, X, Save, Send } from 'lucide-react';

const INDUSTRIES = [
  'Information Technology', 'Finance & Banking', 'Healthcare', 'Education', 'E-commerce',
  'Manufacturing', 'Retail', 'Hospitality & Tourism', 'Real Estate', 'Media & Entertainment',
  'Consulting', 'Legal', 'Logistics & Supply Chain', 'Automobile', 'Agriculture', 'Other',
];

const EXPERIENCE_OPTIONS = ['Fresher (0 years)', '0-1 years', '1-2 years', '2-3 years', '3-5 years', '5-8 years', '8-10 years', '10+ years'];

const defaultForm = {
  jobTitle: '', jobLocation: '', experienceRequired: '', industryCategory: '',
  employmentType: '', workMode: '', jobDescription: '', keySkills: [] as string[],
  numberOfOpenings: '', jobExpiryDate: '',
  salaryMin: '', salaryMax: '', educationQualification: '', interviewProcess: '', agePreference: '',
};

export default function PostJob() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState(defaultForm);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      getJobById(id!)
        .then(res => {
          const job = res.data.job;
          setForm({
            jobTitle: job.jobTitle || '',
            jobLocation: job.jobLocation || '',
            experienceRequired: job.experienceRequired || '',
            industryCategory: job.industryCategory || '',
            employmentType: job.employmentType || '',
            workMode: job.workMode || '',
            jobDescription: job.jobDescription || '',
            keySkills: job.keySkills || [],
            numberOfOpenings: job.numberOfOpenings?.toString() || '',
            jobExpiryDate: job.jobExpiryDate ? new Date(job.jobExpiryDate).toISOString().split('T')[0] : '',
            salaryMin: job.salaryMin?.toString() || '',
            salaryMax: job.salaryMax?.toString() || '',
            educationQualification: job.educationQualification || '',
            interviewProcess: job.interviewProcess || '',
            agePreference: job.agePreference || '',
          });
        })
        .catch(() => setError('Failed to load job.'))
        .finally(() => setFetchLoading(false));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !form.keySkills.includes(skill)) {
      setForm({ ...form, keySkills: [...form.keySkills, skill] });
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) => setForm({ ...form, keySkills: form.keySkills.filter(s => s !== skill) });

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); }
  };

  const validate = () => {
    const required = ['jobTitle', 'jobLocation', 'experienceRequired', 'industryCategory', 'employmentType', 'workMode', 'jobDescription', 'numberOfOpenings', 'jobExpiryDate'];
    for (const f of required) {
      if (!form[f as keyof typeof form]) return `Please fill in ${f.replace(/([A-Z])/g, ' $1').toLowerCase()}.`;
    }
    if (form.keySkills.length === 0) return 'Please add at least one key skill.';
    return null;
  };

  const submit = async (status: 'Draft' | 'Active') => {
    const err = validate();
    if (err) return setError(err);
    setLoading(true);
    try {
      const payload = { ...form, numberOfOpenings: Number(form.numberOfOpenings), status };
      if (isEdit) {
        await updateJob(id!, payload);
      } else {
        await createJob(payload);
      }
      navigate('/employer/manage-jobs');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save job.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-200 transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Job' : 'Post a New Job'}</h1>
            <p className="text-sm text-gray-500">Fill in the job details below</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-red-700 text-sm">{error}</div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
          {/* Mandatory Section */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Job Title *">
                <input name="jobTitle" value={form.jobTitle} onChange={handleChange} placeholder="e.g. Senior React Developer"
                  className="input-field" />
              </Field>
              <Field label="Job Location *">
                <input name="jobLocation" value={form.jobLocation} onChange={handleChange} placeholder="e.g. Mumbai, Maharashtra"
                  className="input-field" />
              </Field>
              <Field label="Experience Required *">
                <select name="experienceRequired" value={form.experienceRequired} onChange={handleChange} className="input-field">
                  <option value="">Select experience</option>
                  {EXPERIENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Industry Category *">
                <select name="industryCategory" value={form.industryCategory} onChange={handleChange} className="input-field">
                  <option value="">Select industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </Field>
              <Field label="Employment Type *">
                <select name="employmentType" value={form.employmentType} onChange={handleChange} className="input-field">
                  <option value="">Select type</option>
                  {['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Work Mode *">
                <select name="workMode" value={form.workMode} onChange={handleChange} className="input-field">
                  <option value="">Select mode</option>
                  {['Onsite', 'Hybrid', 'Remote'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Number of Openings *">
                <input type="number" name="numberOfOpenings" value={form.numberOfOpenings} onChange={handleChange} min="1" placeholder="e.g. 3"
                  className="input-field" />
              </Field>
              <Field label="Job Expiry Date *">
                <input type="date" name="jobExpiryDate" value={form.jobExpiryDate} onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]} className="input-field" />
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Job Description *">
                <textarea name="jobDescription" value={form.jobDescription} onChange={handleChange} rows={6}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  className="input-field resize-none" />
              </Field>
            </div>

            {/* Skills */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Key Skills *</label>
              <div className="flex gap-2">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown}
                  placeholder="Type a skill and press Enter"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={addSkill}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.keySkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.keySkills.map(skill => (
                    <span key={skill} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Optional Section */}
          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Optional Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Minimum Salary (₹/year)">
                <input type="number" name="salaryMin" value={form.salaryMin} onChange={handleChange} placeholder="e.g. 300000"
                  className="input-field" />
              </Field>
              <Field label="Maximum Salary (₹/year)">
                <input type="number" name="salaryMax" value={form.salaryMax} onChange={handleChange} placeholder="e.g. 600000"
                  className="input-field" />
              </Field>
              <Field label="Education Qualification">
                <input name="educationQualification" value={form.educationQualification} onChange={handleChange}
                  placeholder="e.g. B.Tech / MBA" className="input-field" />
              </Field>
              <Field label="Age Preference">
                <input name="agePreference" value={form.agePreference} onChange={handleChange}
                  placeholder="e.g. 22-35 years" className="input-field" />
              </Field>
              <div className="md:col-span-2">
                <Field label="Interview Process">
                  <textarea name="interviewProcess" value={form.interviewProcess} onChange={handleChange} rows={3}
                    placeholder="e.g. Phone screening → Technical round → HR round"
                    className="input-field resize-none" />
                </Field>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => submit('Draft')} disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-60">
              <Save className="w-4 h-4" /> Save as Draft
            </button>
            <button type="button" onClick={() => submit('Active')} disabled={loading}
              className="flex items-center justify-center gap-2 flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-60">
              <Send className="w-4 h-4" /> {loading ? 'Publishing...' : 'Publish Job'}
            </button>
          </div>
        </div>
      </div>

      <style>{`.input-field { width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: all .15s; } .input-field:focus { border-color: transparent; box-shadow: 0 0 0 2px #3b82f6; }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}