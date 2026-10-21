'use client';

import { Avatar } from '@/components/ui/Avatar';
import { FaceStack } from '@/components/ui/FaceStack';
import { useGrantPage } from '@/components/Funding/GrantPageContext';
import { formatFundingAmount, toBackers } from '@/components/Funding/lib/fundingAmounts';
import { BYLINE_BOX_CLASS, BYLINE_CHIP_CLASS } from '@/components/work/lib/bylineChip';
import { useFundraises } from '@/contexts/FundraiseContext';
import { formatCurrency } from '@/utils/currency';
import { formatTimestamp } from '@/utils/date';
import { pluralizeSuffix } from '@/utils/stringUtils';
import { cn } from '@/utils/styles';

/**
 * Over an RFP's Details tab, as a proposal's byline sits over its own: who
 * funds it and since when, then chips for the award, the proposals so far and
 * the deadline. Where the sidebar's pool card is hidden, a chip shows the
 * backers. The other tabs open straight on their lists.
 */
export function GrantByline({ openedDate }: { openedDate?: string }) {
  const { proposalCount } = useFundraises();
  const {
    activeTab,
    organization,
    organizationProfile,
    grantAmount,
    fundingPool,
    applications,
    isActive,
    isPending,
  } = useGrantPage();

  // One face per applicant, however many proposals they sent.
  const applicants = [...new Map(applications.map((a) => [a.profile.id, a.profile])).values()];
  const backerCount = fundingPool?.contributors.total ?? 0;
  const isClosed = !isActive && !isPending;

  if (activeTab !== 'details') return null;

  return (
    <div className={BYLINE_BOX_CLASS}>
      {organization && (
        <div className="flex items-center gap-3">
          <Avatar
            src={organizationProfile?.profileImage}
            alt={organization}
            size="md"
            authorId={organizationProfile?.id}
          />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-gray-900">{organization}</p>
            {openedDate && (
              // Formatted in the server's time zone first; the browser's can read a day apart.
              <p suppressHydrationWarning className="truncate text-[13px] text-gray-500">
                Funds this call · since {formatTimestamp(openedDate, false)}
              </p>
            )}
          </div>
        </div>
      )}

      <ul className={cn('flex flex-wrap gap-1.5', organization && 'mt-3')}>
        {grantAmount?.usd ? (
          // Green only while the RFP takes proposals; once closed the money is no longer on offer.
          <li className={cn(BYLINE_CHIP_CLASS, isActive && 'bg-emerald-50 text-emerald-800')}>
            <span className="font-mono font-semibold">
              {formatCurrency({
                amount: grantAmount.usd,
                showUSD: true,
                exchangeRate: 1,
                skipConversion: true,
              })}
            </span>
            {isClosed ? 'in funding' : 'available'}
          </li>
        ) : null}
        {fundingPool && backerCount > 0 && (
          // From lg up the sidebar's pool card shows the backers.
          <li className={cn(BYLINE_CHIP_CLASS, 'gap-1.5 lg:hidden')}>
            <FaceStack
              faces={toBackers(fundingPool.contributors.top, true)}
              ringClassName="ring-gray-100"
            />
            {backerCount} backer{pluralizeSuffix(backerCount)} ·{' '}
            <span className="font-mono font-semibold">
              {formatFundingAmount(fundingPool.amountRaised, true)}
            </span>
          </li>
        )}
        <li className={cn(BYLINE_CHIP_CLASS, applicants.length > 0 && 'gap-1.5')}>
          {applicants.length > 0 && (
            <FaceStack
              faces={applicants.map((profile) => ({
                name: profile.fullName,
                image: profile.profileImage,
                authorId: profile.id,
              }))}
              ringClassName="ring-gray-100"
            />
          )}
          {proposalCount > 0
            ? `${proposalCount} proposal${pluralizeSuffix(proposalCount)}`
            : 'No proposals yet'}
        </li>
        {/* Open RFPs take proposals on a rolling basis for now, whatever their
            end date. A pending one will once it is approved. A closed one has
            no chip: the cover's badge says it is closed. */}
        {!isClosed && <li className={BYLINE_CHIP_CLASS}>Rolling deadline</li>}
      </ul>
    </div>
  );
}
