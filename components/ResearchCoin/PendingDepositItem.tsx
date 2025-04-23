'use client';

import { Coins, ExternalLink } from 'lucide-react';
import { PendingDeposit } from '@/services/transaction.service';

const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
const BLOCK_EXPLORER_URL = IS_PRODUCTION
  ? 'https://basescan.org/tx/'
  : 'https://sepolia.basescan.org/tx/';

interface PendingDepositItemProps {
  deposit: PendingDeposit;
}

export function PendingDepositItem({ deposit }: PendingDepositItemProps) {
  const date = new Date(deposit.created_date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Format the full date for display
  const fullFormattedDate = `${formattedDate} at ${formattedTime}`;

  // Get explorer link based on environment
  const getExplorerLink = () => {
    return `${BLOCK_EXPLORER_URL}${deposit.transaction_hash}`;
  };

  return (
    <div className="group">
      <div className="relative py-3 rounded-lg px-4 -mx-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-3 w-full">
            <div className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-orange-50">
              <Coins className="h-4 w-4 text-orange-600" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">Pending Deposit</p>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-600">
                <span>{fullFormattedDate}</span>
                <span>•</span>
                <a
                  href={getExplorerLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  View transaction
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex flex-col items-end min-w-[140px]">
              <div className="flex items-center justify-end w-full">
                <div className="flex flex-col items-end">
                  <span className="text-base font-medium text-orange-600">
                    +{deposit.amount} RSC
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
