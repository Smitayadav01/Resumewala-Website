import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          Resumewala – Terms & Conditions
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <p className="text-gray-600 mb-6">
          By accessing or using Resumewala, you agree to these Terms & Conditions.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          1. Platform Usage
        </h2>
        <p className="text-gray-600 mb-4">
          Resumewala provides job-related services. Users must provide accurate
          and up-to-date information while using the platform.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          2. User Responsibilities
        </h2>
        <p className="text-gray-600 mb-4">
          Users must not misuse the platform, attempt unauthorized access, or
          provide false, misleading, or unlawful information.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          3. Content Ownership
        </h2>
        <p className="text-gray-600 mb-4">
          Users retain ownership of their resumes and profile content but grant
          Resumewala permission to use this information solely for job-related
          services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          4. Account Termination
        </h2>
        <p className="text-gray-600 mb-4">
          Accounts may be suspended or terminated in case of policy violations,
          misuse, or suspicious activities, at our discretion.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          5. Limitation of Liability
        </h2>
        <p className="text-gray-600 mb-4">
          Resumewala does not guarantee job placement and shall not be held
          responsible for actions, decisions, or outcomes involving third
          parties such as employers or recruiters.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          6. Service Changes
        </h2>
        <p className="text-gray-600 mb-4">
          Resumewala reserves the right to modify, suspend, or discontinue any
          part of the services at any time without prior notice.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          7. Governing Law
        </h2>
        <p className="text-gray-600 mb-4">
          These Terms & Conditions shall be governed by and interpreted in
          accordance with the laws of India.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          8. Contact
        </h2>
        <p className="text-gray-600">
          Email: <span className="font-medium">support@resumewala.co.in</span>
        </p>
      </div>
    </div>
  );
};

export default Terms;
