'use client';

import { Coins, ExternalLink } from 'lucide-react';
import { PendingDeposit } from '@/services/transaction.service';
import { formatTimestamp } from '@/utils/date';

const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
const BLOCK_EXPLORER_URL = IS_PRODUCTION
  ? 'https://basescan.org/tx/'
  : 'https://sepolia.basescan.org/tx/';

interface PendingDepositItemProps {
  deposit: PendingDeposit;
}

export function PendingDepositItem({ deposit }: PendingDepositItemProps) {
  const formattedDate = formatTimestamp(deposit.created_date);
  const explorerLink = `${BLOCK_EXPLORER_URL}${deposit.transaction_hash}`;

  return (
    <div className="group">
      <div className="relative py-3 rounded-lg px-4 -mx-4">
        <div className="flex items-center justify-between min-w-0">
          <div className="flex gap-3 w-full min-w-0">
            <div className="w-[38px] h-[38px] flex shrink-0 items-center justify-center rounded-full bg-orange-50">
              <Coins size={18} className="text-orange-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">Pending Deposit</p>
              </div>
              <div className="text-xs text-gray-600 mt-0.5 flex items-center gap-2 min-w-0">
                <span>{formattedDate}</span>
                <span>·</span>
                <a
                  href={explorerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors min-w-0 truncate"
                >
                  <span className="truncate">View transaction</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
            </div>

            <div className="flex flex-col items-end w-[88px] min-[360px]:w-[104px] sm:w-[140px] shrink-0 min-w-0">
              <div className="flex items-center justify-end w-full">
                <div className="flex flex-col items-end min-w-0 max-w-full">
                  <span className="text-sm font-bold text-orange-600 truncate max-w-full">
                    +{deposit.amount} RSC
                  </span>
                  <span className="text-[11px] text-orange-500 mt-0.5 truncate max-w-full">
                    Confirming…
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
