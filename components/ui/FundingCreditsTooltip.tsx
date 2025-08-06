import { Check } from 'lucide-react';
import Link from 'next/link';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';

export function FundingCreditsTooltip() {
  return (
    <div className="w-[280px] p-3 pt-1 text-left pb-1">
      {/* Header with icon and title */}
      <div className="flex flex-col items-center mb-3">
        <div className="bg-blue-50 rounded-lg p-2 flex items-center justify-center mb-2">
          <ResearchCoinIcon outlined size={24} color="#2563eb" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 text-center">Funding Credits</h3>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3">
        Funding credits must be spent on proposals on ResearchHub.
      </p>

      {/* Feature list */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-700">Earn credits through referrals</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-700">
            Can be used for funding proposals on platform (including your own!)
          </span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-700">Cannot be withdrawn</span>
        </div>
      </div>

      {/* Learn more link */}
      <div className="mt-3 pt-2.5 border-t text-center border-gray-100">
        <Link
          href="/referral"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
        >
          Learn more about referrals
          <span className="text-xs">→</span>
        </Link>
      </div>
    </div>
  );
}
