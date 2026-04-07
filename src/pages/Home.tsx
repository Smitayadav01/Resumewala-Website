import { Briefcase, Upload, CheckCircle, ArrowRight, FilePlus, Zap, Shield, BarChart3 } from 'lucide-react';
import head from '../assets/lady.png';
import { useRef, useState,useEffect } from 'react';
import upload from '../assets/upload.png';
import { uploadResume } from '../services/profileApi';
import { useProfile } from '../context/ProfileContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
// import demoVideo from '../assets/demo.mp4';


interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const { setProfile } = useProfile();
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);
  const [loading,setLoading] = useState(false); 
  const [parsing, setParsing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
const rotatingWords = [
  "Get Discovered",
  "Get Noticed",
  "Get Interview Calls",
  "Get Hired Faster"
];

const [wordIndex, setWordIndex] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setWordIndex((prev) => (prev + 1) % rotatingWords.length);
  }, 2500);

  return () => clearInterval(interval);
}, []);

 const handleFileSelect = async (file: File) => {
  if (!file || uploading) return;

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedTypes.includes(file.type)) {
    toast.error("Please upload PDF, DOC or DOCX file");
    return;
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    toast.error("File size must be less than 5MB");
    return;
  }

  setParsing(true);
  setUploading(true);

  try {
    const token = localStorage.getItem("token"); // ✅ optional now

    // 👇 pass token only if exists
    const prev = localStorage.getItem("guestResumePublicId")
    console.log("uploaded1");
    const res = await uploadResume(file, token || undefined, prev ?? undefined)
    console.log("uploeded2");
    if (!res.ok) {
      toast.error("Failed to parse resume");
      setParsing(false);
      return;
    }

    const data = await res.json();

setProfile(data.profile);

setTimeout(() => {
  setParsing(false);

  const token = localStorage.getItem("token");

  if (!token) {
  localStorage.setItem("guestResume", JSON.stringify(data.profile));

  setShowSuccessModal(true); // ✅ show popup instead of direct redirect
} else {
  navigate("/profile");
}

}, 1200);

  } catch (err) {
    console.error(err);
    toast.error("Error uploading resume. Please try again.");
    setParsing(false);
  } finally {
    setUploading(false);
  }
};

  return (
    <div className=" bg-white">

      <section className="relative overflow-hidden bg-white pt-2 pb-8 lg:pt-4">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">

      {/* LEFT SIDE */}
      <div className="space-y-6">

        {/* Upload Box */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            handleFileSelect(file);
          }}
          className="relative group p-5 sm:p-6 lg:p-8 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 hover:border-blue-500 hover:bg-blue-100 transition-all cursor-pointer"
        >

          {/* 🔥 TRUST STAMP */}
          <div className="absolute -top-2 right-3 sm:-top-6 sm:right-6 z-20">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-2 border-green-500 shadow-lg flex flex-col items-center justify-center text-center rotate-[-12deg]">
              <span className="text-xs sm:text-sm font-bold text-green-600">
                100% FREE
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500">
                Verified
              </span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            disabled={loading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />

          <div className="text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>

            <p className="text-lg sm:text-xl font-bold text-gray-900">
              Upload Resume
            </p>

            <p className="text-sm sm:text-base text-gray-600">
              or tap to browse
            </p>

            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Auto-fills your profile — fast & secure
            </p>
          </div>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Upload Your Resume,{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
              {rotatingWords[wordIndex]}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 mt-3">
            Free for job seekers · Suitable for freshers & experienced professionals
          </p>
        </div>

        {/* Points */}
        <div className="flex flex-wrap gap-4 pt-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-700 font-medium">100% Free</span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-700 font-medium">Interview Calls</span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-700 font-medium">Job matching</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div className="flex justify-center lg:justify-end mt-4 lg:mt-0">
        <div className="relative w-full max-w-[200px] sm:max-w-[260px] md:max-w-sm">

          <img
            src={head}
            alt="Resume upload"
            className="w-full h-auto object-contain rounded-2xl mx-auto"
          />
            </div>
          </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Upload Resume to RESUMEWALA?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simplest way to connect with verified employers actively hiring
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <FilePlus className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">One-Time Resume Upload</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload your resume once and get considered for multiple verified job opportunities—no repeated applications.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Direct Access to Verified Employers</h3>
              <p className="text-gray-600 leading-relaxed">
                Your profile is visible only to genuine employers and recruiters actively hiring.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Faster & Relevant Job Discovery</h3>
              <p className="text-gray-600 leading-relaxed">
                Get discovered for roles that match your profile without endlessly searching or applying.
              </p>
            </div>
          </div>
        </div>
      </section>



      <section id="benefits" className="py-20 bg-gradient-to-br from-teal-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  What Happens After Upload?
                </h2>
                <p className="text-lg text-gray-600">
                  Your resume starts working for you immediately
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-sm">✓</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Automatic Profile Creation</h4>
                    <p className="text-gray-600 text-sm">Your profile is created automatically using details from your resume. No long forms to fill.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-sm">✓</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1"> Visible to Verified Employers</h4>
                    <p className="text-gray-600 text-sm">Your profile becomes searchable to genuine employers actively hiring on Resumewala.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-sm">✓</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Relevant Job Opportunities</h4>
                    <p className="text-gray-600 text-sm">See job openings that match your skills and experience.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-sm">✓</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">For Freshers & Experienced Candidates</h4>
                    <p className="text-gray-600 text-sm">Whether you’re a fresher, actively job-hunting, or have 2+ years of experience, Resumewala helps you get employer visibility.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-4 border border-gray-100">
              <img
                src={upload}
                alt="Professional success"
                className="rounded-2xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>



{/* AI Parsing Loader */}
{parsing && (
  <div className="fixed inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center z-50">
    
    <div className="text-center">

      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        AI is analyzing your resume
      </h3>

      <p className="text-gray-600 text-sm">
        Extracting skills, experience and building your profile...
      </p>

    </div>

  </div>
)}

{showSuccessModal && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    
    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-fadeIn">

      {/* Icon */}
      <div className="flex justify-center mb-5">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Resume Uploaded Successfully 🎉
      </h2>

      {/* Message */}
      <p className="text-gray-600 mb-6 text-sm leading-relaxed">
        Your resume has been uploaded successfully.  
        To save your profile and access it anytime, kindly login.
      </p>

      {/* Buttons */}
      <div className="flex gap-3 justify-center">

        <button
          onClick={() => {
            setShowSuccessModal(false);
            navigate("/login");
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition"
        >
          Login Now
        </button>

        {/* <button
          onClick={() => setShowSuccessModal(false)}
          className="border border-gray-300 px-6 py-2 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition"
        >
          Later
        </button> */}

      </div>
    </div>
  </div>
)}

</div>

);
}

