import React from 'react';

export const PersonaVerificationSkeleton: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Header */}
      <div className="w-full mb-4">
        <div className="h-8 w-3/4 bg-gray-100 rounded-md animate-pulse mb-4 mx-auto" />
        <div className="h-4 w-5/6 bg-gray-100 rounded-md animate-pulse mx-auto" />
        <div className="h-4 w-4/6 bg-gray-100 rounded-md animate-pulse mx-auto mt-2" />
      </div>

      {/* ID Documents Illustration */}
      <div className="w-full mb-4">
        <div className="h-32 w-48 bg-gray-100 rounded-md animate-pulse mb-4 mx-auto" />
      </div>

      {/* Consent Text */}
      <div className="w-full mb-4">
        <div className="h-3 w-full bg-gray-100 rounded-md animate-pulse mb-2" />
        <div className="h-3 w-full bg-gray-100 rounded-md animate-pulse mb-2" />
        <div className="h-3 w-full bg-gray-100 rounded-md animate-pulse mb-2" />
        <div className="h-3 w-3/4 bg-gray-100 rounded-md animate-pulse" />
      </div>

      {/* Begin Verifying Button */}
      <div className="w-full h-12 bg-indigo-100 rounded-lg animate-pulse mb-4" />

      {/* Saved ID Button */}
      <div className="w-full h-12 bg-gray-100 rounded-lg border border-gray-200 animate-pulse mb-4" />
    </div>
  );
};
