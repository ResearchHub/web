import React from 'react';

export function PublishingFormSkeleton() {
  return (
    <div className="w-82 flex flex-col h-screen sticky right-0 top-0 bg-white">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="pb-6">
          {/* Work Type Section */}
          <div className="py-3 px-6">
            <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-10 w-full bg-gray-100 rounded" />
          </div>

          {/* Authors Section */}
          <div className="py-3 px-6">
            <div className="h-5 w-24 bg-gray-200 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-8 w-full bg-gray-100 rounded" />
            </div>
          </div>

          {/* Topics Section */}
          <div className="py-3 px-6">
            <div className="h-5 w-24 bg-gray-200 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-8 w-full bg-gray-100 rounded" />
            </div>
          </div>

          {/* Journal Section */}
          <div className="p-6">
            <div className="h-5 w-28 bg-gray-200 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-10 w-full bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom section */}
      <div className="border-t bg-white p-2 lg:p-6 space-y-3 sticky bottom-0">
        <div className="h-10 w-full bg-gray-200 rounded" />
      </div>
    </div>
  );
}
