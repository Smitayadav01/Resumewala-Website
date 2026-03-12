import React from "react";
import { Briefcase, Zap } from "lucide-react";


export default function Employee() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="text-center max-w-lg p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
        <div className="flex justify-center mb-6">
          <Briefcase className="h-12 w-12 text-blue-600" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Employee Section
        </h1>

        <p className="text-gray-600 mb-6 text-lg">
          🚀 We are working hard to bring you this feature. <br />
          Stay tuned! Coming soon...
        </p>

        <div className="mt-6">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-2 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all"
          >
            <Zap className="h-5 w-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}