import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Star,
  Zap,
  ArrowRight,
  MessageCircle,
  Upload,
  X,
  Loader2,
  BadgeCheck,
  Target,
  TrendingUp,
  Award,
  Users,
  Clock,
  Shield,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

// Replace this with your actual WhatsApp number
const WHATSAPP_URL = "https://wa.me/917506836835";

const PACKAGES = [
  {
    id: "basic",
    name: "Basic",
    price: "₹99",
    tagline: "Get recruiter-ready fast",
    badge: "",
    color: "border-gray-200",
    btnClass:
      "border border-gray-300 text-gray-700 hover:bg-gray-50",
    features: [
      "ATS-optimised formatting",
      "Clean professional layout",
      "PDF delivery within 48 hrs",
      "1 free minor revision",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: "₹199",
    tagline: "Most popular — complete overhaul",
    badge: "Most Popular",
    color: "border-blue-500",
    btnClass: "bg-blue-600 text-white hover:bg-blue-700",
    features: [
      "Everything in Basic",
      "Keyword enhancement for your target role",
      "Impact-driven bullet points",
      "Section-by-section review",
      "2 free revisions",
      "Delivered within 36 hrs",
    ],
  },
  {
    id: "Premium",
    name: "Premium Optimisation",
    price: "₹299",
    tagline: "Get noticed by recruiters on LinkedIn",
    badge: "",
    color: "border-indigo-400",
    btnClass: "bg-indigo-600 text-white hover:bg-indigo-700",
    features: [
      "Optimised LinkedIn headline",
      "About section rewrite",
      "Experience section enhancement",
      "Skills & endorsements strategy",
      "Recruiter search keyword mapping",
      "Delivered within 48 hrs",
    ],
  },
];

const FAQS = [
  {
    q: "What is ATS and why does it matter?",
    a: "ATS (Applicant Tracking System) is software used by many companies to filter resumes before a recruiter reviews them. Our service focuses on clean formatting, relevant keywords, and recruiter-friendly content to improve compatibility with these systems.",
  },
  {
    q: "How do I place an order?",
    a: "Fill the order form below, select your package, upload your current resume if you have one, and submit. Once we receive your order, our team will contact you to confirm the details and share the payment link.",
  },
  {
    q: "How long does delivery take?",
    a: "Basic and LinkedIn packages are generally delivered within 48 hours. Professional packages are generally delivered within 36 hours. Urgent delivery may be available on request.",
  },
  {
    q: "What if I'm not happy with the result?",
    a: "Basic includes 1 free revision and Professional includes 2 free revisions. Additional revisions can also be requested if required.",
  },
  {
    q: "Do you guarantee job interviews?",
    a: "No. A strong resume can improve your chances of getting noticed, but interview selection depends on your skills, experience, job requirements, competition, and the employer's hiring process.",
  },
  {
    q: "Can freshers use this service?",
    a: "Absolutely. The service can be used by freshers, experienced professionals, career changers, and candidates returning after a career gap.",
  },
];

const WHY_US = [
  {
    icon: <Target className="h-6 w-6" />,
    title: "Recruiter-Focused",
    desc: "Designed around what recruiters and hiring managers typically look for.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "ATS-First Approach",
    desc: "Clean formatting designed for compatibility with Applicant Tracking Systems.",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Fast Turnaround",
    desc: "36–48 hour delivery so you can continue applying without long delays.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Revision Support",
    desc: "Free revisions are included based on the package you select.",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Keyword Optimised",
    desc: "Relevant keywords aligned with your target roles and job descriptions.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "For All Levels",
    desc: "Suitable for freshers, experienced professionals, and career changers.",
  },
];

const INITIAL_FORM = {
  name: "",
  email: "",
  mobile: "",
  experience: "",
  targetRole: "",
  package: "professional",
  message: "",
};

type FormDataState = typeof INITIAL_FORM;

export default function ResumeServices() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormDataState>(INITIAL_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5 MB");

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const allowedExtensions = [".pdf", ".doc", ".docx"];

    const hasAllowedType = allowedTypes.includes(selectedFile.type);

    const hasAllowedExtension = allowedExtensions.some((extension) =>
      selectedFile.name.toLowerCase().endsWith(extension)
    );

    if (!hasAllowedType && !hasAllowedExtension) {
      toast.error("Only PDF, DOC, or DOCX files are allowed");

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.mobile.trim() ||
      !form.targetRole.trim()
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const mobileRegex = /^[6-9]\d{9}$/;

    if (!mobileRegex.test(form.mobile.trim())) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    if (!API_URL) {
      toast.error("API URL is not configured");
      console.error(
        "VITE_API_URL is missing from environment variables."
      );
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (file) {
        data.append("resume", file);
      }

      const response = await fetch(
        `${API_URL}/api/resume/order`,
        {
          method: "POST",
          body: data,
        }
      );

      let result: any = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            `Unable to submit order (${response.status})`
        );
      }

      toast.success("Order submitted successfully!");

      setForm(INITIAL_FORM);
      removeFile();

      navigate("/resume-services/thank-you");
    } catch (error) {
      console.error("Order error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-4 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium">
            <BadgeCheck className="h-4 w-4" />
            ATS-Optimised Resume Writing Service
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Make Your Resume
            <br />
            <span className="text-yellow-300">
              Recruiter Ready
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-blue-100 sm:text-xl">
            Build a professionally written, ATS-friendly resume
            tailored to your target role and designed to help you
            stand out to recruiters.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={scrollToForm}
              className="flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-8 py-4 text-lg font-bold text-gray-900 shadow-lg transition hover:bg-yellow-300"
            >
              Get My Resume Fixed
              <ArrowRight className="h-5 w-5" />
            </button>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-green-400"
            >
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </a>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8">
            {[
              { n: "500+", l: "Resumes Delivered" },
              { n: "4.9★", l: "Average Rating" },
              { n: "36hr", l: "Fast Turnaround" },
            ].map((item) => (
              <div key={item.l} className="text-center">
                <p className="text-3xl font-bold text-yellow-300">
                  {item.n}
                </p>

                <p className="mt-0.5 text-sm text-blue-100">
                  {item.l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose Resumewala?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-gray-500">
              We tailor your resume around your experience,
              industry, target role, and recruiter expectations.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  {item.icon}
                </div>

                <h3 className="mb-2 font-bold text-gray-900">
                  {item.title}
                </h3>

                <p className="text-sm leading-relaxed text-gray-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ATS EXPLAINER */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-block rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-600">
                The Problem
              </div>

              <h2 className="mb-5 text-3xl font-bold text-gray-900">
                Why Good Candidates Get Rejected
              </h2>

              <p className="mb-4 leading-relaxed text-gray-600">
                Many companies use{" "}
                <strong className="text-gray-800">
                  Applicant Tracking Systems (ATS)
                </strong>{" "}
                to organise and screen applications before a recruiter
                reviews them.
              </p>

              <p className="mb-6 leading-relaxed text-gray-600">
                Complex layouts, graphics, unusual headings, and
                irrelevant or missing keywords can make your resume
                harder for ATS software and recruiters to understand.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  "Complex tables",
                  "Images & graphics",
                  "Unusual fonts",
                  "Missing keywords",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
                  >
                    <X className="h-4 w-4 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-600">
                The Solution
              </div>

              <h2 className="mb-5 text-3xl font-bold text-gray-900">
                What We Do Differently
              </h2>

              <div className="space-y-3">
                {[
                  "Clean ATS-friendly layout",
                  "Role-specific keywords matched to job descriptions",
                  "Strong action verbs and measurable achievements",
                  "Clear and standard section headings",
                  "Optimised file format",
                  "Human-readable and machine-friendly structure",
                ].map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 text-sm text-gray-700"
                  >
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section
        className="bg-gray-50 px-4 py-16"
        id="packages"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Choose Your Package
            </h2>

            <p className="mt-3 text-gray-500">
              Select the service that best matches your career needs.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative flex flex-col rounded-2xl border-2 bg-white p-6 shadow-sm ${
                  pkg.color
                } ${
                  pkg.id === "professional"
                    ? "md:scale-105 md:shadow-xl"
                    : ""
                }`}
              >
                {pkg.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white">
                    {pkg.badge}
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-lg font-bold text-gray-900">
                    {pkg.name}
                  </h3>

                  <p className="mt-0.5 text-xs text-gray-400">
                    {pkg.tagline}
                  </p>

                  <div className="mt-3">
                    <span className="text-4xl font-bold text-gray-900">
                      {pkg.price}
                    </span>

                    <span className="ml-1 text-sm text-gray-400">
                      one-time
                    </span>
                  </div>
                </div>

                <ul className="mb-6 flex-1 space-y-2.5">
                  {pkg.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-gray-700"
                    >
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      package: pkg.id,
                    }));

                    setTimeout(scrollToForm, 100);
                  }}
                  className={`w-full rounded-xl py-3 text-sm font-semibold transition ${pkg.btnClass}`}
                >
                  Order {pkg.name}
                </button>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Secure payments · Confidential information · Support
            available for every order
          </p>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            The Resumewala Difference
          </h2>

          <p className="mb-10 text-gray-500">
            See how stronger resume writing can present your
            experience more effectively.
          </p>

          <div className="grid gap-6 text-left md:grid-cols-2">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                  <X className="h-4 w-4 text-red-600" />
                </div>

                <h3 className="font-bold text-red-700">
                  Before
                </h3>
              </div>

              <div className="space-y-2 text-sm text-red-800">
                {[
                  "Responsible for managing projects",
                  "Helped the team with various tasks",
                  "Did sales and marketing work",
                  "Used Excel and other tools",
                  "Generic objective statement",
                  "Complex layout and formatting",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2"
                  >
                    <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-500" />

                    <span className="opacity-70 line-through">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>

                <h3 className="font-bold text-green-700">
                  After — Professionally Optimised
                </h3>
              </div>

              <div className="space-y-2 text-sm text-green-800">
                {[
                  "Led a 5-member team delivering 3 projects on schedule",
                  "Reduced manual workload by 40% through automation",
                  "Increased regional revenue from ₹12L to ₹18L",
                  "Advanced Excel: VLOOKUP, Pivot Tables, Macros",
                  "Results-focused summary with target-role keywords",
                  "Clean ATS-friendly layout",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2"
                  >
                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-500" />

                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-900">
            How It Works
          </h2>

          <p className="mb-12 text-gray-500">
            Simple, fast, and hassle-free
          </p>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {[
              {
                step: "1",
                icon: <FileText className="h-6 w-6" />,
                title: "Fill the Form",
                desc: "Share your details, target role, and current resume.",
              },
              {
                step: "2",
                icon: <Award className="h-6 w-6" />,
                title: "Choose Package",
                desc: "Select the resume service that fits your needs.",
              },
              {
                step: "3",
                icon: <Zap className="h-6 w-6" />,
                title: "Resume Review",
                desc: "We review and improve your resume based on your target role.",
              },
              {
                step: "4",
                icon: <Star className="h-6 w-6" />,
                title: "Start Applying",
                desc: "Receive your improved resume and start applying confidently.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="absolute -top-3 left-4 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {item.step}
                </div>

                <div className="mx-auto mb-3 mt-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  {item.icon}
                </div>

                <h3 className="mb-1 text-sm font-bold text-gray-900">
                  {item.title}
                </h3>

                <p className="text-xs leading-relaxed text-gray-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ORDER FORM */}
      <section
        className="scroll-mt-20 bg-white px-4 py-16"
        ref={formRef}
        id="order-form"
      >
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Start Your Order
            </h2>

            <p className="mt-2 text-gray-500">
              Fill in your details and our team will contact you
              regarding the next steps.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
          >
            {/* Package selector */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Select Package *
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {PACKAGES.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        package: pkg.id,
                      }))
                    }
                    className={`rounded-xl border-2 px-2 py-3 text-center transition ${
                      form.package === pkg.id
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-xs font-bold">
                      {pkg.name}
                    </div>

                    <div className="mt-0.5 text-lg font-extrabold">
                      {pkg.price}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Full Name *
                </label>

                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Mobile Number *
                </label>

                <input
                  type="tel"
                  name="mobile"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  autoComplete="tel"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email Address *
                </label>

                <input
                  type="email"
                  name="email"
                  required
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Years of Experience
                </label>

                <input
                  type="text"
                  name="experience"
                  placeholder="e.g. 3 years / Fresher"
                  value={form.experience}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Target Job Role *
                </label>

                <input
                  type="text"
                  name="targetRole"
                  required
                  placeholder="e.g. Software Engineer, HR Manager"
                  value={form.targetRole}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Any specific requirements or notes?
              </label>

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={3}
                placeholder="e.g. I'm changing careers from IT to marketing. Focus on transferable skills..."
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Resume upload */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Upload Current Resume
                <span className="font-normal text-gray-400">
                  {" "}
                  (optional but recommended)
                </span>
              </label>

              <div
                role="button"
                tabIndex={0}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition ${
                  file
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                }`}
                onClick={() => fileRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    fileRef.current?.click();
                  }
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-6 w-6 text-green-600" />

                    <div className="min-w-0 text-left">
                      <p className="truncate text-sm font-medium text-green-700">
                        {file.name}
                      </p>

                      <p className="text-xs text-green-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="ml-2 text-red-400 hover:text-red-600"
                      aria-label="Remove resume"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />

                    <p className="text-sm text-gray-500">
                      Click to upload your current resume
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      PDF, DOC or DOCX · Max 5 MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-base font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Order
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              Your information and uploaded resume are kept
              confidential and used only to process your order.
            </p>
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.q}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left font-medium text-gray-800 transition hover:bg-gray-50"
                    onClick={() =>
                      setOpenFaq(isOpen ? null : index)
                    }
                  >
                    <span className="text-sm">{faq.q}</span>

                    {isOpen ? (
                      <ChevronUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    ) : (
                      <ChevronDown className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 px-5 pb-4 pt-3 text-sm leading-relaxed text-gray-600">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-blue-600 px-4 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Upgrade Your Resume?
          </h2>

          <p className="mb-8 text-lg text-blue-100">
            Choose your resume package and start building a stronger
            professional profile. Packages start at ₹99.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={scrollToForm}
              className="rounded-xl bg-yellow-400 px-8 py-4 text-base font-bold text-gray-900 shadow-lg transition hover:bg-yellow-300"
            >
              Order Now — Starting ₹99
            </button>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-green-400"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* STICKY WHATSAPP */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-green-500 p-4 text-white shadow-2xl transition hover:bg-green-600"
        title="Chat on WhatsApp"
        aria-label="Chat with Resumewala on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />

        <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 group-hover:max-w-xs">
          Chat with us
        </span>
      </a>
    </div>
  );
}









// import { useEffect, useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';
// import {
//   CheckCircle2, XCircle, Clock, Award, RefreshCw, Star,
//   ArrowRight, Upload, FileText, Sparkles, ShieldCheck,
//   MessageSquareText, ChevronDown, Linkedin, FileCheck2,
// } from 'lucide-react';
// import { trackViewContent } from '../utils/metaPixel';

// const API_URL = import.meta.env.VITE_API_URL;

// type PackageKey = 'basic' | 'linkedin' | 'professional';

// interface PackagePlan {
//   key: PackageKey;
//   name: string;
//   price: number;
//   tagline: string;
//   popular?: boolean;
//   features: string[];
// }

// const PACKAGES: PackagePlan[] = [
//   {
//     key: 'basic',
//     name: 'Basic Rewrite',
//     price: 99,
//     tagline: 'A clean, ATS-ready resume that gets past the filters.',
//     features: [
//       'ATS-friendly formatting',
//       'Keyword optimisation for your target role',
//       '1 free revision',
//       'Delivery in 48 hours',
//     ],
//   },
//   {
//     key: 'professional',
//     name: 'Professional + Cover Letter',
//     price: 199,
//     tagline: 'Our most complete package — resume, cover letter and more.',
//     popular: true,
//     features: [
//       'Everything in Basic Rewrite',
//       'Tailored cover letter',
//       '2 free revisions',
//       'Priority delivery in 36 hours',
//       'LinkedIn summary included',
//     ],
//   },
//   {
//     key: 'linkedin',
//     name: 'LinkedIn Makeover',
//     price: 299,
//     tagline: 'Get found by recruiters searching on LinkedIn.',
//     features: [
//       'Compelling headline & summary rewrite',
//       'Keyword-optimised for recruiter search',
//       'Skills & experience polish',
//       'Delivery in 48 hours',
//     ],
//   },
// ];

// const REJECTION_REASONS = [
//   {
//     icon: XCircle,
//     title: 'Keyword mismatch',
//     desc: "Your resume doesn't use the exact terms the ATS is scanning for, so it never reaches a human.",
//   },
//   {
//     icon: FileText,
//     title: 'Poor formatting',
//     desc: 'Tables, columns and graphics that look great to you can be unreadable to parsing software.',
//   },
//   {
//     icon: MessageSquareText,
//     title: 'Generic content',
//     desc: "Vague bullet points that don't show impact fail to stand out to recruiters or algorithms.",
//   },
// ];

// const STEPS = [
//   { title: 'Choose your package', desc: 'Pick Basic, Professional, or the LinkedIn Makeover based on what you need.' },
//   { title: 'Share your details', desc: 'Tell us your target role and upload your current resume, if you have one.' },
//   { title: 'Our experts get to work', desc: 'A professional writer rewrites and optimises your resume for ATS and recruiters.' },
//   { title: 'Get your new resume', desc: 'Receive your polished resume within 36–48 hours, with a free revision included.' },
// ];

// const FAQS = [
//   {
//     q: "What if I don't have an existing resume?",
//     a: "No problem — you can skip the upload and just tell us about your experience and target role in the form. Our writers will build your resume from scratch.",
//   },
//   {
//     q: 'How fast will I get my resume back?',
//     a: 'Basic and LinkedIn Makeover orders are delivered within 48 hours. Professional package orders get priority delivery in 36 hours.',
//   },
//   {
//     q: 'What if I need changes after delivery?',
//     a: 'Every package includes at least one free revision. Just reply on WhatsApp or email with what you would like changed.',
//   },
//   {
//     q: 'Is my information kept private?',
//     a: 'Yes. Your details and resume are only used to prepare your order and are never shared with employers without your consent.',
//   },
// ];

// export default function ResumeServices() {
//   useEffect(() => {
//     trackViewContent('Resume Services Page');
//   }, []);

//   const navigate = useNavigate();
//   const formRef = useRef<HTMLDivElement | null>(null);
//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   const [selectedPackage, setSelectedPackage] = useState<PackageKey>('professional');
//   const [openFaq, setOpenFaq] = useState<number | null>(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [resumeFile, setResumeFile] = useState<File | null>(null);

//   const [form, setForm] = useState({
//     name: '',
//     email: '',
//     mobile: '',
//     targetRole: '',
//     experience: '',
//     message: '',
//   });

//   const scrollToForm = (pkg?: PackageKey) => {
//     if (pkg) setSelectedPackage(pkg);
//     formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleFileSelect = (file: File | null) => {
//     if (!file) { setResumeFile(null); return; }

//     const allowedTypes = [
//       'application/pdf',
//       'application/msword',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//     ];
//     if (!allowedTypes.includes(file.type)) {
//       toast.error('Please upload a PDF, DOC or DOCX file');
//       return;
//     }
//     const maxSize = 5 * 1024 * 1024;
//     if (file.size > maxSize) {
//       toast.error('File size must be less than 5MB');
//       return;
//     }
//     setResumeFile(file);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!form.name.trim() || !form.email.trim() || !form.mobile.trim() || !form.targetRole.trim()) {
//       toast.error('Please fill in your name, email, mobile and target role');
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const fd = new FormData();
//       fd.append('name', form.name.trim());
//       fd.append('email', form.email.trim());
//       fd.append('mobile', form.mobile.trim());
//       fd.append('targetRole', form.targetRole.trim());
//       fd.append('experience', form.experience.trim());
//       fd.append('message', form.message.trim());
//       fd.append('package', selectedPackage);
//       if (resumeFile) fd.append('resumeFile', resumeFile);

//       const res = await fetch(`${API_URL}/api/resume/orders`, {
//         method: 'POST',
//         body: fd,
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'Failed to submit your order');

//       toast.success('Order received! Our team will reach out shortly.');
//       navigate('/resume-services/thank-you', { state: { package: selectedPackage } });
//     } catch (err: any) {
//       toast.error(err.message || 'Something went wrong. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const activePlan = PACKAGES.find((p) => p.key === selectedPackage)!;

//   return (
//     <div className="bg-white">

//       {/* ── Hero ── */}
//       <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-700 to-sky-600 text-white pt-14 pb-20 px-4">
//         <div className="max-w-5xl mx-auto text-center">
//           <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-xs font-semibold mb-5">
//             <Sparkles className="h-3.5 w-3.5" /> Written by resume experts
//           </div>
//           <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5">
//             Get Your Resume <span className="text-yellow-300">ATS-Ready</span>
//           </h1>
//           <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
//             90% of resumes are rejected by ATS software before a human ever reads them.
//             Our experts rewrite your resume to pass filters and land you interviews —
//             starting at just <strong className="text-yellow-300">₹99</strong>.
//           </p>

//           <div className="flex flex-wrap justify-center gap-3 mt-6">
//             {['ATS-Optimised', '36–48hr Delivery', 'Expert Writers', 'Free Revision'].map((tag) => (
//               <span key={tag} className="bg-white/15 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
//                 <CheckCircle2 className="h-3.5 w-3.5" /> {tag}
//               </span>
//             ))}
//           </div>

//           <button
//             onClick={() => scrollToForm()}
//             className="mt-8 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-xl text-base transition shadow-lg inline-flex items-center gap-2"
//           >
//             Fix My Resume <ArrowRight className="h-4 w-4" />
//           </button>
//         </div>
//       </section>

//       {/* ── Why resumes get rejected ── */}
//       <section className="py-16 bg-gray-50">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
//               Why Most Resumes Get Rejected
//             </h2>
//             <p className="text-gray-600 max-w-xl mx-auto">
//               It's rarely about your experience — it's about how your resume is written.
//             </p>
//           </div>
//           <div className="grid md:grid-cols-3 gap-6">
//             {REJECTION_REASONS.map(({ icon: Icon, title, desc }) => (
//               <div key={title} className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
//                 <div className="bg-rose-50 w-12 h-12 rounded-xl flex items-center justify-center mb-5">
//                   <Icon className="h-6 w-6 text-rose-500" />
//                 </div>
//                 <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
//                 <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── Pricing ── */}
//       <section id="pricing" className="py-16 bg-white">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
//               Choose Your Package
//             </h2>
//             <p className="text-gray-600 max-w-xl mx-auto">
//               No subscriptions. Pay once, get a resume that works.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-6 items-stretch">
//             {PACKAGES.map((plan) => (
//               <div
//                 key={plan.key}
//                 className={`relative flex flex-col rounded-2xl p-7 border-2 transition ${
//                   plan.popular
//                     ? 'border-indigo-500 shadow-xl scale-[1.02]'
//                     : 'border-gray-200 shadow-sm hover:border-indigo-200'
//                 }`}
//               >
//                 {plan.popular && (
//                   <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
//                     <Star className="h-3 w-3 fill-white" /> Most Popular
//                   </span>
//                 )}

//                 <div className="flex items-center gap-2 mb-2">
//                   {plan.key === 'linkedin' ? (
//                     <Linkedin className="h-5 w-5 text-sky-600" />
//                   ) : (
//                     <FileCheck2 className="h-5 w-5 text-indigo-600" />
//                   )}
//                   <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
//                 </div>
//                 <p className="text-sm text-gray-500 mb-4">{plan.tagline}</p>

//                 <div className="mb-5">
//                   <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
//                   <span className="text-sm text-gray-400"> one-time</span>
//                 </div>

//                 <ul className="space-y-2.5 mb-7 flex-1">
//                   {plan.features.map((f) => (
//                     <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
//                       <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
//                       {f}
//                     </li>
//                   ))}
//                 </ul>

//                 <button
//                   onClick={() => scrollToForm(plan.key)}
//                   className={`w-full py-3 rounded-xl font-semibold text-sm transition ${
//                     plan.popular
//                       ? 'bg-indigo-600 text-white hover:bg-indigo-700'
//                       : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
//                   }`}
//                 >
//                   Choose {plan.name.split(' ')[0]}
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── How it works ── */}
//       <section className="py-16 bg-gradient-to-br from-indigo-50 to-white">
//         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">How It Works</h2>
//             <p className="text-gray-600">Four simple steps to a resume that gets you interviews</p>
//           </div>

//           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {STEPS.map((step, i) => (
//               <div key={step.title} className="relative">
//                 <div className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm mb-4">
//                   {i + 1}
//                 </div>
//                 <h4 className="font-bold text-gray-900 mb-1.5">{step.title}</h4>
//                 <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
//               </div>
//             ))}
//           </div>

//           <div className="flex flex-wrap justify-center gap-8 mt-14 text-center">
//             <div className="flex items-center gap-2 text-gray-700">
//               <Clock className="h-5 w-5 text-indigo-600" />
//               <span className="text-sm font-medium">36–48hr turnaround</span>
//             </div>
//             <div className="flex items-center gap-2 text-gray-700">
//               <RefreshCw className="h-5 w-5 text-indigo-600" />
//               <span className="text-sm font-medium">Free revision included</span>
//             </div>
//             <div className="flex items-center gap-2 text-gray-700">
//               <Award className="h-5 w-5 text-indigo-600" />
//               <span className="text-sm font-medium">Written by hiring experts</span>
//             </div>
//             <div className="flex items-center gap-2 text-gray-700">
//               <ShieldCheck className="h-5 w-5 text-indigo-600" />
//               <span className="text-sm font-medium">Your data stays private</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── Order form ── */}
//       <section ref={formRef} className="py-16 bg-gray-50">
//         <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-10">
//             <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
//               Get Started
//             </h2>
//             <p className="text-gray-600">
//               Tell us a bit about yourself — we'll take care of the rest.
//             </p>
//           </div>

//           <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10">

//             {/* Package selector */}
//             <div className="mb-8">
//               <label className="block text-sm font-semibold text-gray-700 mb-3">Selected package</label>
//               <div className="grid sm:grid-cols-3 gap-3">
//                 {PACKAGES.map((plan) => (
//                   <button
//                     type="button"
//                     key={plan.key}
//                     onClick={() => setSelectedPackage(plan.key)}
//                     className={`text-left p-4 rounded-xl border-2 transition ${
//                       selectedPackage === plan.key
//                         ? 'border-indigo-500 bg-indigo-50'
//                         : 'border-gray-200 hover:border-gray-300'
//                     }`}
//                   >
//                     <p className="font-semibold text-gray-900 text-sm">{plan.name}</p>
//                     <p className="text-indigo-600 font-bold text-sm mt-0.5">₹{plan.price}</p>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-5">
//               <div className="grid sm:grid-cols-2 gap-5">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name *</label>
//                   <input
//                     type="text" name="name" value={form.name} onChange={handleChange} required
//                     placeholder="Your full name"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile number *</label>
//                   <input
//                     type="tel" name="mobile" value={form.mobile} onChange={handleChange} required
//                     placeholder="10-digit mobile number"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address *</label>
//                 <input
//                   type="email" name="email" value={form.email} onChange={handleChange} required
//                   placeholder="you@example.com"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>

//               <div className="grid sm:grid-cols-2 gap-5">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1.5">Target role *</label>
//                   <input
//                     type="text" name="targetRole" value={form.targetRole} onChange={handleChange} required
//                     placeholder="e.g. Software Engineer"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience</label>
//                   <input
//                     type="text" name="experience" value={form.experience} onChange={handleChange}
//                     placeholder="e.g. 2 years / Fresher"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                   Anything else we should know?
//                 </label>
//                 <textarea
//                   name="message" value={form.message} onChange={handleChange} rows={3}
//                   placeholder="Tell us about your career goals, companies you're targeting, or anything specific you'd like included..."
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                   Upload existing resume <span className="text-gray-400 font-normal">(optional)</span>
//                 </label>
//                 <div
//                   onClick={() => fileInputRef.current?.click()}
//                   onDragOver={(e) => e.preventDefault()}
//                   onDrop={(e) => {
//                     e.preventDefault();
//                     handleFileSelect(e.dataTransfer.files[0] || null);
//                   }}
//                   className="border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-xl p-6 text-center cursor-pointer transition bg-gray-50"
//                 >
//                   <input
//                     ref={fileInputRef}
//                     type="file"
//                     accept=".pdf,.doc,.docx"
//                     className="hidden"
//                     onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
//                   />
//                   <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
//                   {resumeFile ? (
//                     <p className="text-sm text-gray-700 font-medium">{resumeFile.name}</p>
//                   ) : (
//                     <>
//                       <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
//                       <p className="text-xs text-gray-400 mt-1">PDF, DOC or DOCX — up to 5MB</p>
//                     </>
//                   )}
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-base transition flex items-center justify-center gap-2"
//               >
//                 {submitting ? (
//                   <>
//                     <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                     Submitting...
//                   </>
//                 ) : (
//                   <>
//                     Get Started with {activePlan.name} — ₹{activePlan.price}
//                     <ArrowRight className="h-4 w-4" />
//                   </>
//                 )}
//               </button>
//               <p className="text-xs text-center text-gray-400">
//                 Our team will reach out on WhatsApp or email to confirm payment and details.
//               </p>
//             </form>
//           </div>
//         </div>
//       </section>

//       {/* ── FAQ ── */}
//       <section className="py-16 bg-white">
//         <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-10">
//             <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
//               Frequently Asked Questions
//             </h2>
//           </div>
//           <div className="space-y-3">
//             {FAQS.map((faq, i) => (
//               <div key={faq.q} className="border border-gray-200 rounded-xl overflow-hidden">
//                 <button
//                   onClick={() => setOpenFaq(openFaq === i ? null : i)}
//                   className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-gray-50 transition"
//                 >
//                   <span className="font-semibold text-gray-900 text-sm sm:text-base">{faq.q}</span>
//                   <ChevronDown
//                     className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
//                   />
//                 </button>
//                 {openFaq === i && (
//                   <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
//                     {faq.a}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── Bottom CTA ──
//       <section className="py-14 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-center">
//         <div className="max-w-2xl mx-auto">
//           <h2 className="text-2xl sm:text-3xl font-bold mb-3">
//             Ready to get more interview calls?
//           </h2>
//           <p className="text-blue-100 mb-6">
//             Join job seekers who've upgraded their resume with Resumewala.
//           </p>
//           <button
//             onClick={() => scrollToForm()}
//             className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-xl text-base transition shadow-lg inline-flex items-center gap-2"
//           >
//             Fix My Resume <ArrowRight className="h-4 w-4" />
//           </button>
//         </div>
//       </section> */}

//     </div>
//   );
// }




