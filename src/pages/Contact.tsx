import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function Contact() {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    type: '',
    message: '',
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await fetch("https://resumewala.co.in/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to send message");
    }

    setSuccess(true);

    setFormData({
      name: "",
      email: "",
      subject: "",
      type: "",
      message: "",
    });

  } catch (error) {
    console.error("Contact form error:", error);
    alert("Failed to send message. Please try again.");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-20">

    {/* HERO */}
    <div className="text-center mb-12 sm:mb-16 md:mb-24">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
        Let’s Get in <span className="text-blue-600">Touch</span>
      </h1>

      <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed mt-3">
        Have questions, feedback, or need support? Our team is always here to help you.
      </p>
    </div>

    {/* CONTACT INFO */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 md:mb-24">

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-6 sm:p-8 border text-center">
        <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500"/>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
          Email Us
        </h3>

        <p className="text-gray-700 font-medium mb-1 text-sm sm:text-base">
          info@resumewala.co.in 
        </p>

        <p className="text-xs sm:text-sm text-gray-500">
          Central communication email
        </p>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-6 sm:p-8 border text-center">
        <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500"/>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
          Call Us
        </h3>

        <p className="text-gray-700 font-medium mb-1 text-sm sm:text-base">
          +91 7506836835 
        </p>

        <p className="text-xs sm:text-sm text-gray-500">
          Mon – Fri, 9AM – 6PM
        </p>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-6 sm:p-8 border text-center">
        <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500"/>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
          Location
        </h3>

        <p className="text-gray-700 font-medium mb-1 text-sm sm:text-base">
          Mumbai
        </p>

        <p className="text-xs sm:text-sm text-gray-500">
          Maharashtra, India
        </p>
      </div>

    </div>

    {/* FORM */}
    <div className="max-w-3xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 border">

      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
        Send Us a Message
      </h2>

      {success && (
        <div className="mb-6 flex items-start sm:items-center gap-3 bg-green-50 border border-green-200 text-green-700 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6"/>
          Thank you! Your message has been sent successfully. Our team will contact you shortly.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

        <input
          type="text"
          name="name"
          placeholder="Your Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
        />

        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
        />

        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
        >
          <option value="">Select Inquiry Type</option>
          <option value="candidate">Candidate Query</option>
          <option value="employer">Employer Enquiry</option>
          <option value="vendor">Vendor Communication</option>
          <option value="partnership">Partnership Request</option>
          <option value="general">General Support</option>
        </select>

        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
        />

        <textarea
          name="message"
          rows={5}
          placeholder="Your message"
          value={formData.message}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5"/>
          Send Message
        </button>

      </form>
    </div>
  </div>
</div>
  );
}