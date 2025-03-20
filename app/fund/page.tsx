'use client';

import { FeedItemBody } from '@/components/Feed/FeedItemBody';
import { FundingRequest } from '@/types/feed';
import { PageLayout } from '@/app/layouts/PageLayout';
import { HandCoins } from 'lucide-react';
import Image from 'next/image';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=800';

export default function FundingPage() {
  return (
    <PageLayout>
      <div>
        <div className="pt-4 pb-7">
          <h2 className="text-lg text-gray-600 flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-indigo-500" />
            Fund breakthrough research shaping tomorrow
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"></div>
      </div>
    </PageLayout>
  );
}
