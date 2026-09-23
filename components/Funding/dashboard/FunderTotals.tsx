'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { BaseModal } from '@/components/ui/BaseModal';
import { FunderOverview, SupportedInstitution, SupportedResearcher } from '@/types/funder';
import { formatCurrency } from '@/utils/currency';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { FundingTotalsCard, TotalsRow, TotalsTooltip } from './FundingTotalsCard';

interface FunderTotalsProps {
  overview: FunderOverview | null;
  isLoading: boolean;
  className?: string;
}

/** What a funder has put in, what the community added, and who it reached. */
export const FunderTotals: FC<FunderTotalsProps> = ({ overview, isLoading, className }) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const [isScientistsOpen, setIsScientistsOpen] = useState(false);
  const [isInstitutionsOpen, setIsInstitutionsOpen] = useState(false);

  const fmt = (amount?: { rsc: number; usd: number }) =>
    amount
      ? formatCurrency({
          amount: showUSD ? amount.usd : amount.rsc,
          showUSD,
          exchangeRate,
          shorten: true,
          skipConversion: true,
        })
      : '';

  const scientistCount = overview?.supportedScientistsCount ?? 0;
  const institutionCount = overview?.supportedInstitutionCount ?? 0;

  return (
    <>
      <FundingTotalsCard
        className={className}
        isLoading={isLoading}
        headline={{
          label: 'Total deployed',
          value: fmt(overview?.totalDeployed),
          tooltip: (
            <TotalsTooltip
              title="Total deployed"
              body="Your funding plus the amount the community matched."
            />
          ),
        }}
        stats={[
          { label: 'You have given', value: fmt(overview?.totalGiven) },
          {
            label: 'Matched',
            value: fmt(overview?.communityMatch),
            tooltip: (
              <TotalsTooltip
                title="Community matched"
                body="Funds contributed by other ResearchHub members toward the proposals you've supported."
              />
            ),
          },
        ]}
      >
        {scientistCount > 0 && (
          <TotalsRow
            label={
              <>
                <span className="font-mono font-semibold">{scientistCount}</span>{' '}
                {scientistCount === 1 ? 'scientist' : 'scientists'} supported
              </>
            }
            onShowAll={() => setIsScientistsOpen(true)}
          >
            <AvatarStack
              items={(overview?.supportedResearchers ?? []).map((r) => ({
                src: r.authorProfile.profileImage,
                alt: r.authorProfile.fullName,
              }))}
              size="xs"
              maxItems={5}
              spacing={-6}
              disableTooltip
              showLabel={false}
              className="!flex"
            />
          </TotalsRow>
        )}
        {institutionCount > 0 && (
          <TotalsRow
            label={
              <>
                <span className="font-mono font-semibold">{institutionCount}</span>{' '}
                {institutionCount === 1 ? 'institution' : 'institutions'}
              </>
            }
            onShowAll={() => setIsInstitutionsOpen(true)}
          >
            {/* The count is the row's label; the names wait in the modal. */}
            <span
              aria-hidden="true"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors group-hover:bg-gray-200"
            >
              <Building2 className="h-3.5 w-3.5" />
            </span>
          </TotalsRow>
        )}
      </FundingTotalsCard>

      <ScientistsModal
        isOpen={isScientistsOpen}
        onClose={() => setIsScientistsOpen(false)}
        researchers={overview?.supportedResearchers ?? []}
      />
      <InstitutionsModal
        isOpen={isInstitutionsOpen}
        onClose={() => setIsInstitutionsOpen(false)}
        institutions={overview?.supportedInstitutions ?? []}
      />
    </>
  );
};

const ScientistsModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  researchers: SupportedResearcher[];
}> = ({ isOpen, onClose, researchers }) => (
  <BaseModal isOpen={isOpen} onClose={onClose} title="Scientists supported" size="md">
    <div className="space-y-1">
      {researchers.map((r) => (
        <Link
          key={r.id}
          href={`/author/${r.authorProfile.id}`}
          className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50"
        >
          <Avatar
            src={r.authorProfile.profileImage}
            alt={r.authorProfile.fullName}
            size="sm"
            disableTooltip
            className="flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-gray-900">
              {r.authorProfile.fullName}
            </div>
            {r.authorProfile.headline && (
              <div className="truncate text-xs text-gray-500">{r.authorProfile.headline}</div>
            )}
          </div>
        </Link>
      ))}
    </div>
  </BaseModal>
);

const InstitutionsModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  institutions: SupportedInstitution[];
}> = ({ isOpen, onClose, institutions }) => (
  <BaseModal isOpen={isOpen} onClose={onClose} title="Institutions supported" size="md">
    <div className="space-y-1">
      {institutions.map((inst) => (
        <div key={inst.id} className="rounded-lg px-2 py-2 hover:bg-gray-50">
          <div className="text-sm font-medium text-gray-900">{inst.name}</div>
          {inst.city && (
            <div className="text-xs text-gray-500">
              {inst.city}
              {inst.countryCode ? `, ${inst.countryCode}` : ''}
            </div>
          )}
        </div>
      ))}
    </div>
  </BaseModal>
);
