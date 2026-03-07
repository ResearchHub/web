'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/utils/styles';
import { Icon } from '@/components/ui/icons/Icon';

type EarnTab = 'awards' | 'reviews';

export function EarnSectionCards() {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab: EarnTab = pathname.startsWith('/earn/reviews') ? 'reviews' : 'awards';

  const navigate = (tab: EarnTab) => {
    router.push(tab === 'awards' ? '/earn' : '/earn/reviews', { scroll: false });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 mb-10">
      <button
        onClick={() => navigate('awards')}
        className={cn(
          'rounded-xl border p-4 text-left transition-all',
          activeTab === 'awards'
            ? 'border-indigo-300 bg-indigo-50/40 shadow-sm'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon name="solidHand" size={28} className="shrink-0" />
          <div>
            <h3 className="text-xl font-normal text-gray-900">Funding Opportunities</h3>
            <p className="text-sm text-gray-500 mt-0.5">Submit proposals to compete for funding</p>
          </div>
        </div>
      </button>

      <button
        onClick={() => navigate('reviews')}
        className={cn(
          'rounded-xl border p-4 text-left transition-all',
          activeTab === 'reviews'
            ? 'border-amber-300 bg-amber-50/40 shadow-sm'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon name="peerReview1" size={28} className="shrink-0" />
          <div>
            <h3 className="text-xl font-normal text-gray-900">Peer Reviews</h3>
            <p className="text-sm text-gray-500 mt-0.5">Review papers in your area of expertise</p>
          </div>
        </div>
      </button>
    </div>
  );
}
