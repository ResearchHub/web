'use client';

import Link from 'next/link';
import { ArrowDownCircle, ArrowUpCircle, LucideIcon } from 'lucide-react';
import { cn } from '@/utils/styles';

export type MarketplaceTab = 'grants' | 'proposals';

interface MarketplaceCard {
  key: MarketplaceTab;
  label: string;
  href: string;
  icon: LucideIcon;
  count: string;
  value: string;
  valueLabel: string;
  color: string;
  accentBg: string;
  selectedBg: string;
  selectedBorder: string;
}

const cards: MarketplaceCard[] = [
  {
    key: 'grants',
    label: 'Funding Opportunities',
    href: '/fund/grants',
    icon: ArrowDownCircle,
    count: '5',
    value: '$21.4M',
    valueLabel: 'available',
    color: 'text-emerald-600',
    accentBg: 'bg-emerald-500',
    selectedBg: 'bg-emerald-50/60',
    selectedBorder: 'border-r-emerald-200',
  },
  {
    key: 'proposals',
    label: 'Open Proposals',
    href: '/fund',
    icon: ArrowUpCircle,
    count: '8',
    value: '$548K',
    valueLabel: 'requested',
    color: 'text-blue-600',
    accentBg: 'bg-blue-500',
    selectedBg: 'bg-blue-50/60',
    selectedBorder: '',
  },
];

interface MarketplaceCardsProps {
  selected?: MarketplaceTab;
}

export function MarketplaceCards({ selected = 'grants' }: MarketplaceCardsProps) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden mb-4 grid grid-cols-2">
      {cards.map((card, i) => {
        const isSelected = selected === card.key;
        const isLast = i === cards.length - 1;
        const Icon = card.icon;

        return (
          <Link
            key={card.key}
            href={card.href}
            className={cn(
              'text-left transition-colors',
              !isLast && 'border-r border-gray-200',
              isSelected ? card.selectedBg : 'bg-white hover:bg-gray-50'
            )}
          >
            <div className="px-4 pt-3 pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Icon className={cn('w-4 h-4', card.color)} />
                  <span className="text-sm font-semibold text-gray-700">{card.label}</span>
                </div>
                <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 rounded-full px-2 py-px">
                  {card.count}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={cn('text-2xl font-bold font-mono tracking-tight', card.color)}>
                  {card.value}
                </span>
                <span className="text-xs text-gray-400 font-medium">{card.valueLabel}</span>
              </div>
            </div>
            {isSelected && <div className={cn('h-[3px]', card.accentBg)} />}
          </Link>
        );
      })}
    </div>
  );
}
