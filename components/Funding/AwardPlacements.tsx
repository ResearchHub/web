'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { SidebarCard } from '@/components/ui/SidebarCard';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatFundingAmount } from '@/components/Funding/lib/fundingAmounts';
import {
  getAwardPhase,
  isAwardMechanism,
  type AwardPhase,
} from '@/components/Funding/lib/fundingMechanism';
import { useGrantPage } from '@/components/Funding/GrantPageContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import type { Application } from '@/types/funding';
import { buildWorkUrl, generateSlug } from '@/utils/url';

const MAX_PLACES = 5;

function raisedUsd(application: Application): number {
  return application.fundraise?.amountRaised.usd ?? 0;
}

const SET_ASIDE_NOTE =
  'Set aside. Paid out once this proposal has been open for a week, on the next daily payout.';

function AwardAmount({ amount, phase }: { amount: string; phase: AwardPhase }) {
  const figure = (
    <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-gray-900">
      {phase === 'set-aside' ? (
        <span className="cursor-help underline decoration-dotted decoration-gray-400 underline-offset-2">
          {amount}
        </span>
      ) : (
        amount
      )}
    </span>
  );
  if (phase !== 'set-aside') return figure;
  return (
    <Tooltip content={SET_ASIDE_NOTE} position="top" width="w-56" wrapperAs="span">
      {figure}
    </Tooltip>
  );
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
 * The award RFP's top five, by what each proposal has received. Includes money
 * still set aside. There is no separate awardees list: this is the grant's
 * own applications.
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
    <SidebarCard title="Awardees">
      <ol className="mt-2 flex flex-col">
        {placed.map((application, index) => {
          const href = proposalHref(application);
          const title = application.fundraise?.title || 'Proposal';
          const phase = getAwardPhase(application.fundraise);
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
              <AwardAmount amount={amount} phase={phase} />
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
