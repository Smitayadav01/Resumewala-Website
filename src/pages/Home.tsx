import { Briefcase, Upload, CheckCircle, ArrowRight, FilePlus, Zap, Shield, BarChart3 } from 'lucide-react';
import head from '../assets/lady.png';
import { useRef } from 'react';
import upload from '../assets/upload.png';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

const handleFileSelect = async (file: File) => {
  if (!file) return;

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedTypes.includes(file.type)) {
    alert('Please upload a PDF or Word file');
    return;
  }

  try {
    // Prepare form data
    const formData = new FormData();
    formData.append('resume', file);

    // Send to backend API
    const res = await fetch('http://localhost:5000/api/parse-resume', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Failed to parse resume');

    const data = await res.json();
    console.log('Parsed resume data:', data);

    // Navigate to Profile page and pass parsed data
    onNavigate('profile', data);

  } catch (err) {
    console.error(err);
    alert('Error uploading resume. Please try again.');
  }
};


  return (
    <div className="min-h-screen bg-white">

      <section className="relative overflow-hidden bg-white pt-0 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            
            <div className="space-y-5 mt-0">
               <div
  onClick={() => fileInputRef.current?.click()}
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }}
  className="group p-8 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 hover:border-blue-500 hover:bg-blue-100 transition-all cursor-pointer"
>
  <input
    ref={fileInputRef}
    type="file"
    accept=".pdf,.doc,.docx"
    className="hidden"
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
      PDF or Word format • Auto-fills your profile
    </p>
  </div>
</div>

              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Upload Your Resume,{' '}
                  <span className="bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent font-bold">
  Get Discovered
</span>

                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Free for job seekers · Suitable for freshers & experienced professionals
                </p>
              </div>

             

              {/* <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onNavigate('upload')}
                  className="group flex-1 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Now
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="flex-1 bg-gray-100 text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all font-semibold text-lg"
                >
                  Create Account
                </button>
              </div> */}

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
  <img
    src={head}
    alt="Resume upload illustration"
   className="
  w-full 
  max-w-sm 
  lg:max-w-md
  h-auto
  object-contain
  cursor-pointer
  transition-transform
  duration-300
  hover:scale-95
"

    onClick={() => onNavigate('landing')}
  />
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

      {/* <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple 3-Step Process
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>

            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100">
                <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Create Account</h3>
                <p className="text-gray-600 text-center leading-relaxed text-sm">
                  Register with your email and mobile number. Quick verification and you're in.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-blue-200 ring-2 ring-blue-100">
                <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Upload Resume</h3>
                <p className="text-gray-600 text-center leading-relaxed text-sm">
                  Upload your resume in PDF or Word format. We auto-fill your profile details.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => onNavigate('upload')}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                  >
                    Upload Now
                  </button>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100">
                <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  3
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Get Discovered</h3>
                <p className="text-gray-600 text-center leading-relaxed text-sm">
                  Employers find you. Receive interview calls and manage applications in your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

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

      {/* <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Get Discovered?
          </h2>
          <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto">
            Upload your resume now and start receiving interview calls from verified employers
          </p>
          <button
            onClick={() => onNavigate('upload')}
            className="group bg-white text-blue-600 px-10 py-4 rounded-xl hover:bg-gray-50 transition-all font-bold text-lg shadow-xl hover:shadow-2xl inline-flex items-center"
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload Your Resume
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section> */}

      
    </div>
  );
}
