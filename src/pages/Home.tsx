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

  const allowedTypes = ['application/pdf'];

  if (!allowedTypes.includes(file.type)) {
    toast.error("Please upload a PDF file");
    return;
  
  }


  setParsing(true);   // ✅ START LOADER IMMEDIATELY
  setUploading(true);

  try {

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to upload resume");
      setParsing(false);
      return;
    }

    const res = await uploadResume(file, token);

    if (!res.ok) {
      toast.error("Failed to parse resume");
      setParsing(false);
      return;
    }

    const data = await res.json();

    console.log("Parsed resume data:", data);

    setProfile(data.profile);

    setTimeout(() => {
      setParsing(false);
      navigate("/profile");
    }, 1200); // small delay for animation

  } catch (err) {
    console.error(err);
    toast.error("Error uploading resume. Please try again.");
    setParsing(false);
  } finally {
    setUploading(false);
  }
};


  return (
    <div className="min-h-screen bg-white">

      <section className="relative overflow-hidden bg-white pt-0 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">

            <div className="space-y-5 mt-0">
             {/* Upload Box */}
<div
  onClick={() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to upload resume");
      return;
    }
    fileInputRef.current?.click();
  }}
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to upload resume");
      return;
    }
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }}
  className="group p-8 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 hover:border-blue-500 hover:bg-blue-100 transition-all cursor-pointer"
>
  <input
    ref={fileInputRef}
    type="file"
    accept=".pdf"
    className="hidden"
    disabled={loading}
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    }}
  />

  <div className="text-center">
    <div className="w-14 h-14 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
      <Upload className="h-7 w-7 text-blue-600" />
    </div>
    <p className="text-lg font-bold text-gray-900 mb-2">
      Upload Resume
    </p>
    <p className="text-gray-600 mb-3">or click to browse</p>
    <p className="text-sm text-gray-500">
      PDF format • Auto-fills your profile
    </p>
  </div>
</div>

              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Upload Your Resume,{' '}
<span className="bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent font-bold transition-all duration-500">
  {rotatingWords[wordIndex]}
</span>

                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Free for job seekers · Suitable for freshers & experienced professionals
                </p>
              </div>

              <div className="flex gap-6 pt-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 font-medium text-sm">100% Free</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 font-medium text-sm">Interview Calls</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 font-medium text-sm">Job matching</p>
                </div>
              </div>
            </div>
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm lg:max-w-md">

              {/* Girl Image */}
              <img
                src={head}
                alt="Resume upload illustration"
                className="w-full h-auto object-contain rounded-2xl"
              />

              {/* Play Button (Centered on Image)
              <button
                onClick={() => setShowVideo(true)}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="bg-white/80 backdrop-blur-md p-5 rounded-full shadow-xl 
                                hover:scale-110 transition-all duration-300">
                  <div className="bg-blue-600 w-14 h-14 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </button> */}

            </div>
          </div>



          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-50">
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
                className="rounded-2xl w-70 h-70 object-cover"
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

</div>

);
}

