import { Info } from 'lucide-react';

export const InfoBanner: React.FC = () => (
  <div className="bg-indigo-50 rounded-lg p-4 mb-6">
    <div className="flex items-start space-x-3">
      <div className="bg-indigo-100 rounded-lg p-2">
        <Info className="h-5 w-5 text-indigo-600" />
      </div>
      <div>
        <h3 className="font-medium text-gray-900">Get Verified</h3>
        <p className="text-sm text-gray-600 mt-1">
          Verify your academic credentials to unlock additional features and build trust in the
          community.
        </p>
        <button className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Learn More →
        </button>
      </div>
    </div>
  </div>
);
