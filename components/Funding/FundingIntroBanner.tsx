'use client';

import { X, Microscope, Users } from 'lucide-react';
import Link from 'next/link';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';

export function FundingIntroBanner() {
  const { isDismissed, dismissFeature, dismissStatus } =
    useDismissableFeature('funding_intro_banner');

  if (isDismissed || dismissStatus !== 'checked') return null;

  return (
    <div className="mb-4 rounded-xl p-[1.5px]">
      <div className="relative rounded-[10px] overflow-hidden bg-gradient-to-r from-primary-50 to-primary-50 via-primary-100">
        <div className="absolute inset-0 " />

        <div className="relative grid grid-cols-[1fr_1fr] items-center px-6 py-4">
          {/* Column 1: Researchers */}
          <div className="flex items-center gap-3 pr-6 border-r border-primary-200">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-200/60 flex-shrink-0">
              <Microscope className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-base font-bold text-primary-900 mb-0.5">Researchers</p>
              <p className="text-sm text-primary-700">
                <Link
                  href="/fund/proposal/create"
                  className="text-primary-800 hover:text-primary-900 underline underline-offset-2"
                >
                  Submit a proposal
                </Link>{' '}
                to compete for awards
              </p>
            </div>
          </div>

          {/* Column 2: Anyone */}
          <div className="flex items-center justify-between pl-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-200/60 flex-shrink-0">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-base font-bold text-primary-900 mb-0.5">Anyone</p>
                <p className="text-sm text-primary-700">
                  Fund a proposal or{' '}
                  <Link
                    href="/notebook?newGrant=true"
                    className="text-sm text-primary-800 hover:text-primary-900 underline underline-offset-2"
                  >
                    Create funding opportunity
                  </Link>
                </p>
              </div>
            </div>

            <button
              onClick={() => dismissFeature()}
              className="p-1.5 rounded-full hover:bg-primary-200/60 transition-colors ml-4"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4 text-primary-400 hover:text-primary-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
