'use client';

import { AuthorLink } from '@/components/ui/AuthorLink';
import { Avatar } from '@/components/ui/Avatar';
import { FaceStack } from '@/components/ui/FaceStack';
import { Tooltip } from '@/components/ui/Tooltip';
import { BackersTip } from '@/components/Funding/FundingCard';
import { useFundPanel } from '@/components/Funding/FundPanelContext';
import { useGrantPage } from '@/components/Funding/GrantPageContext';
import { formatFundingAmount, toBackers } from '@/components/Funding/lib/fundingAmounts';
import {
  actionButtonProps,
  getApplyUnavailableReason,
} from '@/components/Funding/lib/unavailableAction';
import { BYLINE_BOX_CLASS, BYLINE_LINK_CHIP_CLASS } from '@/components/work/lib/bylineChip';
import { useFundraises } from '@/contexts/FundraiseContext';
import { formatCurrency } from '@/utils/currency';
import { formatTimestamp } from '@/utils/date';
import { pluralizeSuffix } from '@/utils/stringUtils';
import { cn } from '@/utils/styles';

/** A chip's faces ring in its gray, a shade darker while the chip is hovered. */
const CHIP_FACE_RING_CLASS = 'ring-gray-100 group-hover/chip:ring-gray-200';

/**
 * Over an RFP's Details tab, as a proposal's byline sits over its own: who
 * funds it and since when, then chips for the award, the proposals so far and
 * the deadline. Where the sidebar's pool card is hidden, a chip shows the
 * backers. Each chip opens what it is about: the award the Fund panel while
 * the pool takes money and the proposals after, the backers who they are,
 * the proposals their tab and the deadline Apply. The other tabs open
 * straight on their lists.
 */
export function GrantByline({ openedDate }: { openedDate?: string }) {
  const { proposalCount } = useFundraises();
  const {
    activeTab,
    showTab,
    organization,
    organizationProfile,
    grantAmount,
    fundingPool,
    applications,
    isActive,
    isPending,
    isPoolOpen,
    canApply,
    setIsApplyPanelOpen,
  } = useGrantPage();
  const { openFundPanel } = useFundPanel();

  // One face per applicant, however many proposals they sent.
  const applicants = [...new Map(applications.map((a) => [a.profile.id, a.profile])).values()];
  const backerCount = fundingPool?.contributors.total ?? 0;
  const isClosed = !isActive && !isPending;
  const apply = actionButtonProps(
    () => setIsApplyPanelOpen(true),
    getApplyUnavailableReason({ canApply, isPending })
  );

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
            {/* A funder with its own account opens its profile card on hover. */}
            <p className="flex min-w-0 text-base font-semibold text-gray-900">
              <AuthorLink
                authorId={organizationProfile?.id}
                name={organization}
                className="truncate"
              />
            </p>
            {openedDate && (
              // Formatted in the server's time zone first; the browser's can read a day apart.
              <p suppressHydrationWarning className="truncate text-[13px] text-gray-500">
                Funds this call · since {formatTimestamp(openedDate, false)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Each li is a flex box, so its chip sets its height rather than a line of text. */}
      <ul className={cn('flex flex-wrap gap-1.5', organization && 'mt-3')}>
        {grantAmount?.usd ? (
          <li className="flex">
            <button
              type="button"
              onClick={isPoolOpen ? openFundPanel : () => showTab('proposals')}
              aria-haspopup={isPoolOpen ? 'dialog' : undefined}
              className={cn(
                BYLINE_LINK_CHIP_CLASS,
                // Green only while the RFP takes proposals; once closed the money is no longer on offer.
                isActive && 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              )}
            >
              <span className="font-mono font-semibold">
                {formatCurrency({
                  amount: grantAmount.usd,
                  showUSD: true,
                  exchangeRate: 1,
                  skipConversion: true,
                })}
              </span>
              {isClosed ? 'in funding' : 'available'}
            </button>
          </li>
        ) : null}
        {fundingPool && backerCount > 0 && (
          // From lg up the sidebar's pool card shows the backers. Here a tap,
          // or a hover, lists them as the card's bar does.
          <li className="flex lg:hidden">
            <Tooltip
              content={
                <BackersTip
                  heading={
                    <>
                      {backerCount} backer{pluralizeSuffix(backerCount)} added{' '}
                      <span className="font-mono">
                        {formatFundingAmount(fundingPool.amountRaised, true)}
                      </span>
                    </>
                  }
                  backers={toBackers(fundingPool.contributors.top, true)}
                  total={backerCount}
                />
              }
              position="bottom"
              width="w-64"
            >
              <button type="button" className={cn(BYLINE_LINK_CHIP_CLASS, 'group/chip gap-1.5')}>
                <FaceStack
                  faces={toBackers(fundingPool.contributors.top, true)}
                  ringClassName={CHIP_FACE_RING_CLASS}
                  linked={false}
                />
                {backerCount} backer{pluralizeSuffix(backerCount)} ·{' '}
                <span className="font-mono font-semibold">
                  {formatFundingAmount(fundingPool.amountRaised, true)}
                </span>
              </button>
            </Tooltip>
          </li>
        )}
        <li className="flex">
          <button
            type="button"
            onClick={() => showTab('proposals')}
            className={cn(BYLINE_LINK_CHIP_CLASS, 'group/chip', applicants.length > 0 && 'gap-1.5')}
          >
            {applicants.length > 0 && (
              <FaceStack
                faces={applicants.map((profile) => ({
                  name: profile.fullName,
                  image: profile.profileImage,
                  authorId: profile.id,
                }))}
                ringClassName={CHIP_FACE_RING_CLASS}
                linked={false}
              />
            )}
            {proposalCount > 0
              ? `${proposalCount} proposal${pluralizeSuffix(proposalCount)}`
              : 'No proposals yet'}
          </button>
        </li>
        {/* Open RFPs take proposals on a rolling basis for now, whatever their
            end date, so the deadline opens Apply. A pending one will once it is
            approved. A closed one has no chip: the cover's badge says it is
            closed. */}
        {!isClosed && (
          <li className="flex">
            <button
              type="button"
              aria-haspopup={apply.onClick ? 'dialog' : undefined}
              {...apply}
              className={cn(BYLINE_LINK_CHIP_CLASS, apply.className)}
            >
              Rolling deadline
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
