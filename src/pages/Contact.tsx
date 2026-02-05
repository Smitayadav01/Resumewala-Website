import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* HERO */}
        <div className="text-center mb-24">
          {/* <span className="inline-block bg-blue-100 text-blue-700 px-5 py-2 rounded-full text-sm font-medium mb-6">
            Contact Us
          </span> */}

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Let’s Get in <span className="text-blue-600">Touch</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Have questions, feedback, or need support? Our team is always here to
            help you move forward with confidence.
          </p>
        </div>

        {/* CONTACT INFO */}
        <div className="grid lg:grid-cols-3 gap-8 mb-24">
          {[
            {
              icon: Mail,
              title: 'Email Us',
              value: 'support@resumewala.com',
              note: 'We usually reply within 24 hours',
            },
            {
              icon: Phone,
              title: 'Call Us',
              value: '+91 (123) 456-7890',
              note: 'Mon – Fri, 9:00 AM – 6:00 PM IST',
            },
            {
              icon: MapPin,
              title: 'Our Location',
              value: 'Mumbai, Maharashtra',
              note: 'India',
            },
          ].map((item, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl shadow-md p-8 border border-gray-200 text-center transition-all hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500 transition">
                <item.icon className="h-8 w-8 text-blue-500 group-hover:text-white" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {item.title}
              </h3>

              <p className="text-gray-700 font-medium mb-1">{item.value}</p>
              <p className="text-sm text-gray-500">{item.note}</p>
            </div>
          ))}
        </div>

        {/* FORM + FAQ */}
        <div className="grid lg:grid-cols-2 gap-10">

          {/* FORM */}
          <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { label: 'Name', name: 'name', type: 'text', placeholder: 'Your full name' },
                { label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com' },
                { label: 'Subject', name: 'subject', type: 'text', placeholder: 'How can we help?' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-gray-700 font-medium mb-2">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={(formData as any)[field.name]}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3.5 rounded-lg hover:bg-blue-600 transition font-semibold flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                Send Message
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl shadow-xl p-10 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              {[
                {
                  q: 'How do I register on Resumewala?',
                  a: 'Click on Sign Up, enter your basic details, and your account will be created instantly.',
                },
                {
                  q: 'Is my information secure?',
                  a: 'Yes, we use industry-standard security practices and never share your data without consent.',
                },
                {
                  q: 'Can I apply to multiple jobs?',
                  a: 'Absolutely. Apply to unlimited jobs using a single profile.',
                },
                {
                  q: 'How do I update my profile?',
                  a: 'After logging in, visit My Profile to update your details, resume, and preferences.',
                },
              ].map((faq, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
