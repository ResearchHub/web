'use client';

import { FC, useMemo } from 'react';
import { FundingOrganization } from '@/types/fundingOrganization';
import { cn } from '@/utils/styles';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { Carousel, CarouselCard } from '@/components/ui/Carousel';
import { Building2 } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────

const formatAmount = (amount: number) => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount.toLocaleString();
};

// ─── Props ───────────────────────────────────────────────────────────────

interface OrgFilterProps {
  organizations: FundingOrganization[];
  onSelectOrg: (orgSlug: string) => void;
}

export const OrgFilter: FC<OrgFilterProps> = ({ organizations, onSelectOrg }) => {
  const { showUSD } = useCurrencyPreference();

  const cards: CarouselCard[] = useMemo(() => {
    return organizations.map((org) => {
      const amount = showUSD
        ? `$${formatAmount(org.totalFunding.usd)}`
        : `${formatAmount(org.totalFunding.rsc)} RSC`;

      return {
        onClick: () => onSelectOrg(org.slug),
        content: (
          <div className="h-full px-4 py-3 rounded-xl border-2 border-transparent bg-gray-50 hover:bg-gray-100 transition-all duration-200">
            <div className="flex items-center gap-2.5 mb-2">
              {org.imageUrl ? (
                <img
                  src={org.imageUrl}
                  alt={org.name}
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary-600" />
                </div>
              )}
              <span className="font-semibold text-sm text-gray-800 leading-snug truncate">
                {org.name}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {org.grantCount} {org.grantCount === 1 ? 'grant' : 'grants'}
              </span>
              <span className="text-[10px] font-bold text-emerald-500 whitespace-nowrap">
                {amount}
              </span>
            </div>
          </div>
        ),
      };
    });
  }, [organizations, onSelectOrg, showUSD]);

  return (
    <Carousel
      cards={cards}
      cardWidth="w-[240px]"
      gap="gap-2"
      showFadeGradient={true}
      cardClassName="!bg-transparent !p-0 !rounded-none"
    />
  );
};
