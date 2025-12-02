'use client';

import React from 'react';
import { Icon } from '@/components/ui/icons/Icon';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import Link from 'next/link';

interface BountyTooltipProps {
  totalAmount: number;
  href?: string;
  showUSD?: boolean;
}

export function BountyTooltip({ totalAmount, href, showUSD = false }: BountyTooltipProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="space-y-3 text-left" onClick={handleClick}>
      {/* Header with bounty amount */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
        <Icon name="earn1" size={20} color="#f97316" />
        <span className="font-semibold text-gray-900">Bounty Opportunity</span>
        <span className="ml-auto text-lg">
          <CurrencyBadge
            amount={totalAmount}
            variant="text"
            size="lg"
            textColor="text-orange-600"
            iconColor="#f97316"
            iconSize={22}
            fontWeight="font-bold"
            currency={showUSD ? 'USD' : 'RSC'}
            shorten={true}
            showExchangeRate={false}
            showIcon={true}
            showText={false}
          />
        </span>
      </div>

      {/* Explanation */}
      <p className="text-sm text-gray-700">Earn ResearchCoin (RSC) by peer reviewing this paper</p>

      {/* CTA */}
      <div className="pt-2 border-t border-gray-200 text-center">
        {href ? (
          <Link
            href={`${href}/reviews`}
            className="text-sm text-primary-600 hover:text-primary-700 cursor-pointer font-medium"
          >
            Review now
          </Link>
        ) : (
          <p className="text-sm text-primary-600 hover:text-primary-700 cursor-pointer font-medium">
            Review now
          </p>
        )}
      </div>
    </div>
  );
}
