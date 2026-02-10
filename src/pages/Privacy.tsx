import React from 'react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          Resumewala – Privacy Policy
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <p className="text-gray-600 mb-6">
          Resumewala (“we”, “our”, “us”) respects your privacy and is committed
          to protecting the personal information of users (“you”, “your”) who
          access or use our website and services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          1. Information We Collect
        </h2>
        <p className="text-gray-600 mb-4">
          We may collect personal details such as name, email address, mobile
          number, location, resume information, login details, and usage data.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          2. Purpose of Data Collection
        </h2>
        <p className="text-gray-600 mb-4">
          Your information is used to create accounts, provide job-related
          services, share profiles with employers when relevant, improve
          services, and comply with applicable Indian laws.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          3. Data Sharing
        </h2>
        <p className="text-gray-600 mb-4">
          We do not sell user data. Information may be shared with verified
          recruiters, service providers, or legal authorities when required.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          4. Data Security
        </h2>
        <p className="text-gray-600 mb-4">
          Reasonable safeguards are used to protect data; however, no system
          is completely secure.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          5. User Rights
        </h2>
        <p className="text-gray-600 mb-4">
          Users may update their personal data, request deletion of their
          information, or opt out of non-essential communications.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          6. Cookies
        </h2>
        <p className="text-gray-600 mb-4">
          Cookies may be used to improve user experience and analyze platform
          usage.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          7. Children’s Privacy
        </h2>
        <p className="text-gray-600 mb-4">
          Only users aged 18 years or above are permitted to use the
          Resumewala platform.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          8. Updates
        </h2>
        <p className="text-gray-600 mb-4">
          This Privacy Policy may be updated periodically. Any changes will
          be posted on this page.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          9. Contact
        </h2>
        <p className="text-gray-600">
          Email: <span className="font-medium">support@resumewala.in</span>
        </p>
        <p className="text-gray-600">
          Location: <span className="font-medium">India</span>
        </p>
      </div>
    </div>
  );
};

export default Privacy;
