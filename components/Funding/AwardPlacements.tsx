'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { SidebarCard } from '@/components/ui/SidebarCard';
import { formatFundingAmount } from '@/components/Funding/lib/fundingAmounts';
import { getAwardPhase, isAwardMechanism } from '@/components/Funding/lib/fundingMechanism';
import { useGrantPage } from '@/components/Funding/GrantPageContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import type { Application } from '@/types/funding';
import { buildWorkUrl, generateSlug } from '@/utils/url';

const MAX_PLACES = 5;

function raisedUsd(application: Application): number {
  return application.fundraise?.amountRaised.usd ?? 0;
}

function hasAwardMoney(application: Application): boolean {
  return getAwardPhase(application.fundraise) !== 'none';
}

function proposalHref(application: Application): string | null {
  if (application.preregistrationPostId == null) return null;
  const title = application.fundraise?.title;
  return buildWorkUrl({
    id: application.preregistrationPostId,
    contentType: 'preregistration',
    slug: title ? generateSlug(title) : undefined,
  });
}

/**
 * The prize RFP's top five, by what each proposal has been awarded, counting
 * money still waiting on its payout. There is no separate winners list: this
 * is the grant's own applications.
 */
export function AwardPlacements() {
  const { fundingMechanism, applications } = useGrantPage();
  const { showUSD } = useCurrencyPreference();

  if (!isAwardMechanism(fundingMechanism)) return null;

  const placed = applications
    .filter(hasAwardMoney)
    .sort(
      (a, b) =>
        raisedUsd(b) - raisedUsd(a) ||
        (b.fundraise?.amountRaised.rsc ?? 0) - (a.fundraise?.amountRaised.rsc ?? 0)
    )
    .slice(0, MAX_PLACES);

  if (placed.length === 0) return null;

  return (
    <SidebarCard title="Prize winners">
      <ol className="mt-2 flex flex-col">
        {placed.map((application, index) => {
          const href = proposalHref(application);
          const title = application.fundraise?.title || 'Proposal';
          const amount = application.fundraise
            ? formatFundingAmount(application.fundraise.amountRaised, showUSD)
            : '';
          const row = (
            <>
              <span className="w-4 shrink-0 text-sm font-semibold tabular-nums text-gray-400">
                {index + 1}
              </span>
              <Avatar
                src={application.profile.profileImage}
                alt={application.profile.fullName}
                size="xs"
                authorId={application.profile.id}
                disableTooltip
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-gray-900">
                  {application.profile.fullName}
                </span>
                <span className="block truncate text-xs text-gray-500">{title}</span>
              </span>
              <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-gray-900">
                {amount}
              </span>
            </>
          );
          const className = 'flex items-center gap-2.5 rounded-md py-2';

          return (
            <li key={application.id}>
              {href ? (
                <Link href={href} className={`${className} hover:bg-gray-50`}>
                  {row}
                </Link>
              ) : (
                <div className={className}>{row}</div>
              )}
            </li>
          );
        })}
      </ol>
    </SidebarCard>
  );
}
