'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/utils/styles';

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
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">🏆</span>
          <h3 className="text-[15px] font-semibold text-gray-900">Awards</h3>
        </div>
        <p className="text-xs text-gray-500">
          Submit proposals to compete for pooled community funding
        </p>
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
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">📝</span>
          <h3 className="text-[15px] font-semibold text-gray-900">Peer Reviews</h3>
        </div>
        <p className="text-xs text-gray-500">Review papers in your area of expertise</p>
      </button>
    </div>
  );
}
