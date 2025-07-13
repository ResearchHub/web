'use client';

export function ReferralLinkSkeleton() {
  return (
    <section className="bg-white rounded-lg shadow-md flex items-stretch overflow-hidden mb-12 border-4 border-blue-500">
      <div className="flex-grow p-6 md:p-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="flex flex-col gap-4">
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="border-t border-gray-200"></div>
          <div className="flex items-center justify-start gap-4">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
      <div className="hidden md:block w-80 relative flex-shrink-0">
        <div className="w-full h-full bg-gray-200 animate-pulse"></div>
      </div>
    </section>
  );
}
