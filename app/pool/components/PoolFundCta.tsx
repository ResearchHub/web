'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { usePoolFund } from './PoolFundProvider';

interface PoolFundCtaProps {
  className: string;
  children: ReactNode;
  tabIndex?: number;
}

/**
 * Campaign "Fund" CTA. Opens the pooled contribution modal where the pool is
 * fundable, and otherwise links the campaign's fallback (usually its RFP) so
 * proposals can still be backed one at a time.
 *
 * Both branches take the same class so each campaign's own styles apply.
 * `pool-cta-btn` only restores the anchor defaults a `button` drops — campaign
 * CTA rules already set their own font size and weight.
 */
export function PoolFundCta({ className, children, tabIndex }: Readonly<PoolFundCtaProps>) {
  const { isFundable, fallbackUrl, openFundModal } = usePoolFund();

  if (!isFundable) {
    return (
      <Link href={fallbackUrl} className={className} tabIndex={tabIndex}>
        {children}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        className={`${className} pool-cta-btn`}
        onClick={openFundModal}
        tabIndex={tabIndex}
      >
        {children}
      </button>
      <style jsx global>{`
        .pool-cta-btn {
          border: 0;
          cursor: pointer;
          font-family: inherit;
          -webkit-appearance: none;
          appearance: none;
        }
      `}</style>
    </>
  );
}
