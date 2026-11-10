'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Sprout } from 'lucide-react';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { HomePromoFrame, type HomePromoSlotProps } from './HomePromoFrame';

// Loaded on first open so the deposit flow's QR and wallet dependencies stay
// out of the homepage bundle for the visitors who never open it.
const DepositModal = dynamic(
  () => import('@/components/modals/ResearchCoin/DepositModal').then((mod) => mod.DepositModal),
  { ssr: false }
);

const ENDOWMENT_DEPOSIT_FEATURE = 'endowment_deposit_promo';

/** Rising daily yield, as percentages of the chart's height. */
const YIELD_BAR_HEIGHTS = [28, 40, 50, 64, 80, 100];

/**
 * Tells people who may hold ResearchCoin that depositing it here earns funding
 * credits every day, with a door to the deposit address and one to the
 * Endowment page.
 */
export function EndowmentDepositPromo({ variant, className }: HomePromoSlotProps) {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  return (
    <>
      <HomePromoFrame
        variant={variant}
        className={className}
        feature={ENDOWMENT_DEPOSIT_FEATURE}
        label="Earn on your ResearchCoin"
        eyebrow={{ icon: Sprout, text: 'ResearchHub Endowment' }}
        preview={<EarningPreview />}
        // Kept together so the heading never leaves "work" alone on a line.
        title={'Put your RSC to\u00a0work'}
        description="Deposit RSC, earn daily yield in funding credits."
        primaryAction={{
          label: 'Deposit RSC',
          // A deposit address belongs to an account, so a signed-out visitor
          // signs in first and the click replays once they have.
          onClick: () => executeAuthenticatedAction(() => setIsDepositOpen(true)),
        }}
        secondaryAction={{ label: 'How it works', href: '/endowment' }}
      />
      {isDepositOpen && <DepositModal isOpen onClose={() => setIsDepositOpen(false)} />}
    </>
  );
}

/** A deposit growing funding credits day by day: the Endowment, drawn rather than said. */
function EarningPreview() {
  return (
    <div className="flex flex-col gap-1.5 rounded-md bg-gray-100 p-2">
      <p className="flex items-center gap-1 self-end rounded-[10px] rounded-br-sm bg-gray-900 px-1.5 py-1 text-[9.5px] font-medium leading-snug text-white">
        <ResearchCoinIcon size={10} />
        5,000 RSC deposited
      </p>
      <div className="flex flex-col gap-1 rounded-md border border-gray-200 bg-white p-1.5">
        <p className="flex items-center gap-1 text-[8px] font-semibold tracking-wide text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          EARNING · DAILY
        </p>
        <div className="flex h-6 items-end gap-[3px]">
          {YIELD_BAR_HEIGHTS.map((height) => (
            <span
              key={height}
              className="flex-1 rounded-[2px] bg-emerald-200 last:bg-emerald-500"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
