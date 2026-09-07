import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerEmployer } from "../../services/employerApi";
import toast from "react-hot-toast";

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Education", "Manufacturing", "Retail", "Media", "Consulting", "Real Estate", "Other"];

export default function EmployerRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: "", recruiterName: "", email: "", mobile: "",
    password: "", confirmPassword: "", companyLocation: "", companyWebsite: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await registerEmployer(payload);
      toast.success("Registration successful! Please check your email to verify your account.");
      navigate("/employer/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "companyName", label: "Company Name", type: "text", required: true, placeholder: "Acme Corp" },
    { name: "recruiterName", label: "Recruiter Name", type: "text", required: true, placeholder: "John Doe" },
    { name: "email", label: "Official Email", type: "email", required: true, placeholder: "hr@company.com" },
    { name: "mobile", label: "Mobile Number", type: "tel", required: true, placeholder: "+91 98765 43210" },
    { name: "companyLocation", label: "Company Location", type: "text", required: true, placeholder: "Mumbai, Maharashtra" },
    { name: "companyWebsite", label: "Company Website (optional)", type: "url", required: false, placeholder: "https://company.com" },
    { name: "password", label: "Password", type: "password", required: true, placeholder: "Min 6 characters" },
    { name: "confirmPassword", label: "Confirm Password", type: "password", required: true, placeholder: "Re-enter password" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Employer Account</h1>
          <p className="text-gray-500 text-sm mt-1">Start hiring on Resumewala — it's free to register</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fields.map((f) => (
            <div key={f.name} className={f.name === "companyWebsite" || f.name === "companyName" ? "md:col-span-2" : ""}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input
                type={f.type} name={f.name} required={f.required} placeholder={f.placeholder}
                value={(form as any)[f.name]}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <strong>What happens next?</strong>
            <ul className="mt-1 space-y-1 list-disc list-inside text-blue-700">
              <li>You'll receive a verification email</li>
              <li>Our admin team will approve your account within 24 hours</li>
              <li>Once approved, you can login and post jobs</li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Employer Account"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/employer/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}