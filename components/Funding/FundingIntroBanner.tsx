'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Icon } from '../ui/icons';

interface FundingIntroBannerProps {
  onDismiss?: () => void;
}

export function FundingIntroBanner({ onDismiss }: FundingIntroBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="mb-4 rounded-xl p-[1.5px] bg-gradient-to-r from-violet-400 via-indigo-400 via-primary-500 via-sky-400 to-indigo-400">
      <div className="relative rounded-[10px] overflow-hidden bg-gradient-to-r from-primary-50 via-primary-100 to-primary-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(57,113,255,0.07),transparent_70%)]" />

        <div className="relative grid grid-cols-[1fr_1fr_1fr] items-center px-6 py-4">
          {/* Column 1: Branding */}
          <div className="flex flex-row gap-2">
            <Icon name="fund" size={28} color="#1e40b3" className="-mt-1 text-primary-800" />
            <h3 className="text-lg font-bold text-primary-800 tracking-tight">
              Funding Marketplace
            </h3>
          </div>

          {/* Column 2: Researchers */}
          <div className="px-6 border-x border-primary-200">
            <p className="text-base font-bold text-primary-800 mb-0.5">Researchers</p>
            <p className="text-sm text-primary-700">
              <Link
                href="/fund/proposal/create"
                className="text-primary-800 hover:text-primary-800 underline underline-offset-2"
              >
                Submit a proposal
              </Link>{' '}
              to compete for awards
            </p>
          </div>

          {/* Column 3: Anyone */}
          <div className="flex items-center justify-between pl-6">
            <div>
              <p className="text-base font-bold text-primary-800 mb-0.5">Anyone</p>
              <p className="text-sm text-primary-700">
                Fund a proposal or{' '}
                <Link
                  href="/fund/grant/create"
                  className="text-sm text-primary-800 underline underline-offset-2 "
                >
                  create an award
                </Link>
              </p>
            </div>

            <button
              onClick={() => {
                setDismissed(true);
                onDismiss?.();
              }}
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
