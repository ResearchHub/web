import { DashboardPageClient } from '../DashboardPageClient';

export default function ImpactPage() {
  return (
    <DashboardPageClient>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-gray-400 text-sm">Impact tracking coming soon</p>
        <p className="text-gray-300 text-xs mt-1">
          See how your funded research is making a difference
        </p>
      </div>
    </DashboardPageClient>
  );
}
