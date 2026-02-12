import { FC } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { GrantApplication } from '@/types/grantApplication';

interface FeedItemGrantCalloutProps {
  application: GrantApplication;
}

export const FeedItemGrantCallout: FC<FeedItemGrantCalloutProps> = ({ application }) => {
  const { grant } = application;
  const href = `/opportunity/${grant.id}`;

  return (
    <Link
      href={href}
      onClick={(e) => e.stopPropagation()}
      className="mt-1 mb-3 flex items-center gap-3 rounded-lg bg-gray-50 border border-gray-100 px-3.5 py-2 hover:bg-gray-100 transition-colors"
    >
      <div className="flex-1 min-w-0 flex flex-col">
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider leading-tight">
          Responds to
        </p>
        <p className="text-sm font-medium text-gray-900 truncate mt-0.5">
          {grant.title}
          {grant.amount.usd > 0 && (
            <span className="text-gray-500 font-normal">
              {' · '}${grant.amount.usd.toLocaleString()}
            </span>
          )}
        </p>
      </div>
      <ArrowUpRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
    </Link>
  );
};
