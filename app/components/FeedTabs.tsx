'use client'

export const FeedTabs: React.FC = () => (
  <div className="border-b mb-6">
    <div className="flex space-x-8">
      <button className="px-1 py-4 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600">
        For You
      </button>
      <button className="px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">
        Following
      </button>
      <button className="px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">
        Popular
      </button>
      <button className="px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">
        Latest
      </button>
    </div>
  </div>
);