'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

interface TotalFundingSectionProps {
  totalUsd: number;
}

export const TotalFundingSection = ({ totalUsd }: TotalFundingSectionProps) => {
  return (
    <div>
      <div className="text-2xl sm:text-3xl font-bold font-mono text-primary-600 flex items-center gap-1">
        <span>$</span>
        {totalUsd.toLocaleString()}
        <span className="text-lg font-medium">USD</span>
      </div>
      <p className="text-sm text-gray-500 mt-1">Total funding available</p>

      <Link
        href="/notebook?newFunding=true"
        className="w-full mt-4 h-12 px-8 text-base inline-flex items-center justify-center gap-1 rounded-lg font-medium bg-[#3971FF] text-white hover:bg-[#2C5EE8] transition-colors"
      >
        <Plus className="h-4 w-4" /> Create Proposal
      </Link>
    </div>
  );
};
