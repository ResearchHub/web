import React from 'react';

export const OrganizationSwitcherSkeleton: React.FC = () => {
  return (
    <div className="p-4 border-b border-gray-100">
      {/* Organization Button */}
      <div className="px-2 py-2 rounded-lg">
        <div className="flex items-center">
          {/* Avatar */}
          <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse" />
          {/* Org Name */}
          <div className="h-4 w-40 bg-gray-100 rounded ml-2 animate-pulse" />
        </div>
      </div>

      {/* Manage Section */}
      <div className="mt-3">
        <div className="px-3 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            {/* Combined Settings Icon + Manage Text */}
            <div className="h-3 w-60 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
