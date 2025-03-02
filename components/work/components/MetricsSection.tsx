import { BarChart2, Eye, Star } from 'lucide-react';

interface MetricsSectionProps {
  metrics: {
    reviewScore?: number;
    views?: number;
    comments?: number;
    reviews?: number;
  };
}

export const MetricsSection = ({ metrics }: MetricsSectionProps) => {
  return (
    <section>
      <div className="flex items-center space-x-2 mb-4">
        <BarChart2 className="h-5 w-5 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">Metrics</h2>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Review Score</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{metrics.reviewScore || 0}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Views</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{metrics.views || 0}</span>
        </div>
      </div>
    </section>
  );
};
