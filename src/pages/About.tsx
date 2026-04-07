import { Briefcase, Target, Users, Zap, Heart, CheckCircle, Lightbulb, Globe, ArrowRight } from 'lucide-react';
import founderImg from "../assets/Satish image.png";
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white -mt-4 md:-mt-10">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-teal-50 py-10 sm:py-12 md:py-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-60 sm:w-80 h-60 sm:h-80 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 -left-20 w-40 sm:w-60 h-40 sm:h-60 bg-yellow-100 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Transforming How Talent{' '}
            <span className="relative">
              <span className="relative z-10">Meets Opportunity</span>
              <span className="absolute bottom-1 sm:bottom-2 left-0 w-full h-2 sm:h-3 bg-blue-200 -rotate-1"></span>
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Resumewala is more than just a job portal. We're a career enablement platform designed to simplify and modernize the way talented professionals connect with verified employers actively hiring.
          </p>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">

            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Our Story</h2>

              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
               Founded with a clear vision: to bridge the gap between genuine talent and genuine opportunities. We recognized that traditional job portals were overcomplicated, expensive, and often misaligned with what both candidates and employers actually needed.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                 Resumewala was created to offer a transparent, efficient, and cost-effective approach to job discovery and hiring. We serve fresh graduates, early-career professionals, and experienced candidates. For recruiters and HR teams, we provide structured, affordable access to relevant, ready-to-hire talent.
              </p>

              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                Whether you're taking your first step into the workforce or exploring your next career move, we're here to help you connect with the right opportunities. And for recruiters, we're reducing dependency on high-cost recruitment channels while maintaining quality and trust.
              </p>

              <div className="pt-2 sm:pt-4">
                <button
                  onClick={() => navigate('/')}
                  className="group bg-blue-500 text-white px-5 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-blue-600 transition-all font-semibold text-sm sm:text-lg flex items-center"
                >
                  Join Our Community
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* HIDE CARD ON MOBILE */}
            <div className="relative hidden md:block">
              <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-6 md:p-8 text-white shadow-2xl">
                <div className="space-y-6 md:space-y-8">

                  {[Globe, Users, Lightbulb].map((Icon, i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <Icon className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2">
                          {i === 0 ? "Verified Network" : i === 1 ? "Trusted by Thousands" : "Innovative Platform"}
                        </h3>
                        <p className="text-blue-100 text-sm md:text-base">
                          {i === 0 ? "Connected with 1000+ verified employers across India"
                            : i === 1 ? "Job seekers and recruiters rely on us daily"
                            : "Built with cutting-edge technology and user feedback"}
                        </p>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Our Mission</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Driving meaningful change in how careers are built and talent is discovered
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[Target, Users, Heart].map((Icon, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-blue-100">
                <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {i === 0 ? "For Job Seekers" : i === 1 ? "For Recruiters" : "For Society"}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {i === 0
                    ? " Empower you to find the right opportunities aligned with your skills, experience, and career aspirations. Register once, apply everywhere."
                    : i === 1
                    ? "Provide cost-effective, efficient access to verified talent. Build a trusted hiring ecosystem that reduces dependency on expensive recruitment channels."
                    : "Create a trusted ecosystem where talent and opportunity meet quickly, fairly, and transparently. Grow the Indian economy through meaningful employment."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Our Core Values</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[Target, Zap, CheckCircle, Heart].map((Icon, i) => (
              <div key={i} className="bg-blue-50 rounded-2xl p-6 sm:p-8 border">
                <div className="bg-blue-500 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {["Focused", "Simple", "Transparent", "Trusted"][i]}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {["We focus solely on what matters: connecting talent with opportunity. No distractions, no unnecessary features.", "Register once and apply to multiple jobs without repetitive form filling. Simplicity is our strength.", "All job listings are verified from trusted companies. We believe in complete transparency and trust.", "We're committed to earning and maintaining your trust through consistent delivery and integrity."][i]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 to-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <div className="text-center mb-10 sm:mb-12 lg:mb-16">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
        What We Offer
      </h2>
      <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
        Features designed specifically for your success
      </p>
    </div>

    <div className="space-y-4 sm:space-y-6">

      {/* CARD 1 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <Lightbulb className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Smart Job Matching
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">
              Intelligent job recommendations aligned with your profile, skills, preferences, and career goals. Find jobs that truly fit.
            </p>
          </div>
        </div>
      </div>

      {/* CARD 2 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Verified Employers & Listings
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">
              Authentic job postings from verified employers. Every listing is vetted to ensure a safe and trustworthy experience.
            </p>
          </div>
        </div>
      </div>

      {/* CARD 3 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <Zap className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">
              One-Click Applications
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">
              Apply to multiple jobs instantly using your registered profile. No more repetitive form filling or wasted time.
            </p>
          </div>
        </div>
      </div>

      {/* CARD 4 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <Users className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Transparent Pricing for Recruiters
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">
              Reasonable, transparent pricing models designed to reduce hiring costs without compromising on quality or reach.
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<section className="py-12 sm:py-16 lg:py-20 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">

      {/* LEFT */}
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          Why Choose Resumewala?
        </h2>

        <div className="space-y-4">

          {[
            ["User-First Design", "Built for simplicity and speed, with your needs at the center"],
            ["Secure & Responsive", "Fast, secure, and works seamlessly across all devices"],
            ["Trust & Transparency", "Verified employers and transparent processes you can rely on"],
            ["Built to Evolve", "Continuously improving with changing market needs and technology"]
          ].map(([title, desc], i) => (
            <div key={i} className="flex items-start space-x-3 sm:space-x-4">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">
                  {title}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                  {desc}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* RIGHT */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 border border-blue-200">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8">
          Our Commitment
        </h3>

        <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
          We believe the right job can change a life—and the right hire can transform a business.
        </p>

        <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
          At Resumewala, we're committed to creating meaningful connections that drive long-term career and organizational success. Every job match matters. Every career progression counts.
        </p>

        <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
          We're here to make that happen, one connection at a time.
        </p>
      </div>

    </div>
  </div>
</section>

     {/* ===== FOUNDER SECTION ===== */}
<section className="py-12 md:py-16 bg-gradient-to-br from-white to-blue-50">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

    <div className="text-center mb-10 md:mb-12">
      <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
        Meet Our Founder
      </h2>
      <p className="text-base md:text-lg text-gray-600">
        The vision behind Resumewala
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">

      {/* LEFT → IMAGE */}
      {/* LEFT → IMAGE */}
<div className="flex justify-center md:justify-start">
  <img
    src={founderImg}
    alt="Satish Pawar"
    className="
      w-64 h-64
      sm:w-72 sm:h-72
      md:w-80 md:h-80
      lg:w-[380px] lg:h-[380px]
      xl:w-[420px] xl:h-[420px]
      object-cover
      rounded-2xl
      shadow-xl
      border border-gray-200
    "
  />
</div>

      {/* RIGHT → CONTENT */}
      <div className="space-y-3 md:space-y-4">
        <h3 className="text-xl md:text-3xl font-bold text-gray-900">
          Satish Pawar
        </h3>

        <p className="text-blue-600 font-semibold text-sm md:text-lg">
          Founder – Resumewala
        </p>

        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
          Satish Pawar brings over 17 years of experience in banking and leadership roles, with a strong understanding of how recruiters evaluate and shortlist candidates across industries.
        </p>

        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
          He started Resumewala with the aim of bridging the gap between recruiters and job seekers. Many capable candidates miss opportunities because their profiles do not effectively reach the right recruiters.
        </p>

        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
          In many cases, recruiters focus more on experienced candidates due to hiring pressure, limited time, and the cost involved in accessing multiple resume databases. As a result, freshers and deserving candidates are often overlooked.
        </p>

        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
          At the same time, many job seekers are not aware of suitable opportunities, or their profiles are not presented clearly to highlight their strengths and achievements.
        </p>

        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
          With his practical exposure to recruitment, Satish guides job seekers to present their profiles in a structured and professional way so recruiters can easily understand their capabilities.
        </p>

        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
          Resumewala focuses on improving candidate visibility, increasing shortlisting chances, and helping job seekers move closer to the right career opportunities.
        </p>
      </div>

    </div>
  </div>
</section>


    </div>
  );
}