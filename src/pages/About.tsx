import { Briefcase, Target, Users, Zap, Heart, CheckCircle, Lightbulb, Globe, ArrowRight } from 'lucide-react';

interface AboutProps {
  onNavigate: (page: string) => void;
}

export default function About({ onNavigate }: AboutProps) {
  return (
    <div className="min-h-screen bg-white">
      

      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-teal-50 py-10 md:py-2">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 -left-20 w-60 h-60 bg-yellow-100 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-2">
            {/* <span className="bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium">
              About Our Platform
            </span> */}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transforming How Talent{' '}
            <span className="relative">
              <span className="relative z-10">Meets Opportunity</span>
              <span className="absolute bottom-2 left-0 w-full h-3 bg-blue-200 -rotate-1"></span>
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Resumewala is more than just a job portal. We're a career enablement platform designed to simplify and modernize the way talented professionals connect with verified employers actively hiring.
          </p>
        </div>
      </section>

      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">Our Story</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Founded with a clear vision: to bridge the gap between genuine talent and genuine opportunities. We recognized that traditional job portals were overcomplicated, expensive, and often misaligned with what both candidates and employers actually needed.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Resumewala was created to offer a transparent, efficient, and cost-effective approach to job discovery and hiring. We serve fresh graduates, early-career professionals, and experienced candidates. For recruiters and HR teams, we provide structured, affordable access to relevant, ready-to-hire talent.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Whether you're taking your first step into the workforce or exploring your next career move, we're here to help you connect with the right opportunities. And for recruiters, we're reducing dependency on high-cost recruitment channels while maintaining quality and trust.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => onNavigate('register')}
                  className="group bg-blue-500 text-white px-8 py-4 rounded-xl hover:bg-blue-600 transition-all font-semibold text-lg flex items-center"
                >
                  Join Our Community
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-8 text-white shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <Globe className="h-8 w-8 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold mb-2">Verified Network</h3>
                      <p className="text-blue-100">Connected with 1000+ verified employers across India</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Users className="h-8 w-8 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold mb-2">Trusted by Thousands</h3>
                      <p className="text-blue-100">Job seekers and recruiters rely on us daily</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Lightbulb className="h-8 w-8 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold mb-2">Innovative Platform</h3>
                      <p className="text-blue-100">Built with cutting-edge technology and user feedback</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="mission" className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Driving meaningful change in how careers are built and talent is discovered
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-blue-100">
              <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Job Seekers</h3>
              <p className="text-gray-600 leading-relaxed">
                Empower you to find the right opportunities aligned with your skills, experience, and career aspirations. Register once, apply everywhere.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-blue-100">
              <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Recruiters</h3>
              <p className="text-gray-600 leading-relaxed">
                Provide cost-effective, efficient access to verified talent. Build a trusted hiring ecosystem that reduces dependency on expensive recruitment channels.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-blue-100">
              <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Society</h3>
              <p className="text-gray-600 leading-relaxed">
                Create a trusted ecosystem where talent and opportunity meet quickly, fairly, and transparently. Grow the Indian economy through meaningful employment.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="values" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              What guides every decision we make
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-teal-200">
                <div className="bg-blue-500 text-white w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Focused</h3>
                <p className="text-gray-600 leading-relaxed">
                  We focus solely on what matters: connecting talent with opportunity. No distractions, no unnecessary features.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-blue-200">
                <div className="bg-blue-500 text-white w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Simple</h3>
                <p className="text-gray-600 leading-relaxed">
                  Register once and apply to multiple jobs without repetitive form filling. Simplicity is our strength.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-blue-200">
                <div className="bg-blue-500 text-white w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Transparent</h3>
                <p className="text-gray-600 leading-relaxed">
                  All job listings are verified from trusted companies. We believe in complete transparency and trust.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-blue-200">
                <div className="bg-blue-500 text-white w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Heart className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Trusted</h3>
                <p className="text-gray-600 leading-relaxed">
                  We're committed to earning and maintaining your trust through consistent delivery and integrity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What We Offer</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Features designed specifically for your success
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500">
              <div className="flex items-start space-x-4">
                <Lightbulb className="h-8 w-8 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Smart Job Matching</h3>
                  <p className="text-lg text-gray-600">
                    Intelligent job recommendations aligned with your profile, skills, preferences, and career goals. Find jobs that truly fit.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-8 w-8 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Verified Employers & Listings</h3>
                  <p className="text-lg text-gray-600">
                    Authentic job postings from verified employers. Every listing is vetted to ensure a safe and trustworthy experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500">
              <div className="flex items-start space-x-4">
                <Zap className="h-8 w-8 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">One-Click Applications</h3>
                  <p className="text-lg text-gray-600">
                    Apply to multiple jobs instantly using your registered profile. No more repetitive form filling or wasted time.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500">
              <div className="flex items-start space-x-4">
                <Users className="h-8 w-8 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Transparent Pricing for Recruiters</h3>
                  <p className="text-lg text-gray-600">
                    Reasonable, transparent pricing models designed to reduce hiring costs without compromising on quality or reach.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">Why Choose Resumewala?</h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">User-First Design</h3>
                    <p className="text-gray-600">Built for simplicity and speed, with your needs at the center</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Secure & Responsive</h3>
                    <p className="text-gray-600">Fast, secure, and works seamlessly across all devices</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Trust & Transparency</h3>
                    <p className="text-gray-600">Verified employers and transparent processes you can rely on</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Built to Evolve</h3>
                    <p className="text-gray-600">Continuously improving with changing market needs and technology</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-12 border border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Our Commitment</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We believe the right job can change a life—and the right hire can transform a business.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                At Resumewala, we're committed to creating meaningful connections that drive long-term career and organizational success. Every job match matters. Every career progression counts.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We're here to make that happen, one connection at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      
     
    </div>
  );
}
