import React from 'react';

export const NotebookSkeleton: React.FC = () => {
  return (
    <div className="h-full p-8">
      <div className="prose prose-lg max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <div className="h-12 bg-gray-100 rounded-md w-2/3 animate-pulse" />

        {/* Abstract */}
        <div className="space-y-3">
          <div className="h-6 bg-gray-100 rounded-md w-32 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse" />
          </div>
        </div>

        {/* Introduction */}
        <div className="space-y-3">
          <div className="h-6 bg-gray-100 rounded-md w-40 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-4/5 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
          </div>
        </div>

        {/* Methods */}
        <div className="space-y-3">
          <div className="h-6 bg-gray-100 rounded-md w-28 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-11/12 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
