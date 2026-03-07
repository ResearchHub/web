'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/utils/styles';
import { Icon } from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/Icon';
import { Star } from 'lucide-react';
import { FC, ReactNode } from 'react';

type EarnTab = 'awards' | 'reviews';

interface CardDef {
  tab: EarnTab;
  href: string;
  title: string;
  description: string;
  selectedClass: string;
  renderIcon: (selected: boolean) => ReactNode;
}

const cards: CardDef[] = [
  {
    tab: 'awards',
    href: '/earn',
    title: 'Funding Opportunities',
    description: 'Submit proposals to compete for funding',
    selectedClass: 'border-primary-300 bg-primary-50/40 shadow-sm',
    renderIcon: (selected) => (
      <Icon
        name={selected ? 'solidHand' : 'fund'}
        size={28}
        className="shrink-0"
        color={selected ? '#3971ff' : undefined}
      />
    ),
  },
  {
    tab: 'reviews',
    href: '/earn/reviews',
    title: 'Peer Reviews',
    description: 'Review papers in your area of expertise',
    selectedClass: 'border-amber-300 bg-amber-50/40 shadow-sm',
    renderIcon: (selected) => (
      <Star
        size={28}
        className={cn('shrink-0', selected ? 'text-amber-500' : 'text-gray-700')}
        fill={selected ? 'currentColor' : 'none'}
      />
    ),
  },
];

export function EarnSectionCards() {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab: EarnTab = pathname.startsWith('/earn/reviews') ? 'reviews' : 'awards';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 mb-10">
      {cards.map((card) => {
        const selected = activeTab === card.tab;
        return (
          <button
            key={card.tab}
            onClick={() => router.push(card.href, { scroll: false })}
            className={cn(
              'rounded-xl border p-4 text-left transition-all',
              selected
                ? card.selectedClass
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            )}
          >
            <div className="flex items-center gap-3">
              {card.renderIcon(selected)}
              <div>
                <h3 className="text-xl font-normal text-gray-900 tracking-tight">{card.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{card.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
