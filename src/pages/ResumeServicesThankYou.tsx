import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, MessageCircle, Home, Clock } from 'lucide-react';

const PACKAGE_LABELS: Record<string, string> = {
  basic: 'Basic Rewrite',
  professional: 'Professional + Cover Letter',
  linkedin: 'LinkedIn Makeover',
};

export default function ResumeServicesThankYou() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { package?: string } };
  const packageKey = location.state?.package;
  const packageLabel = packageKey ? PACKAGE_LABELS[packageKey] : undefined;

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4 py-16">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Received!</h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          {packageLabel
            ? <>Thanks for choosing the <strong>{packageLabel}</strong> package.</>
            : 'Thanks for placing your order.'}{' '}
          Our team will reach out on WhatsApp or email shortly to confirm your details and payment.
        </p>

        <div className="bg-indigo-50 rounded-xl p-4 flex items-start gap-3 text-left mb-8">
          <Clock className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-800 leading-relaxed">
            Most resumes are delivered within 36–48 hours of confirmation. You'll receive a
            free revision if any changes are needed.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href="https://wa.me/917506836835"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-4 w-4" /> Message us on WhatsApp
          </a>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" /> Back to home
          </button>
        </div>
      </div>
    </div>
  );
}