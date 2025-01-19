'use client'

import { FeedItemBody } from '@/components/Feed/FeedItemBody';
import { fundingFeedEntries } from '@/store/fundingFeedStore';
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {fundingFeedEntries.map((entry) => {
            const content = entry.content as FundingRequest;
            const imageUrl = content.image || DEFAULT_IMAGE;
            
            return (
              <div key={entry.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {content.type === 'funding_request' && (
                  <div className="relative w-full h-48">
                    <Image
                      src={imageUrl}
                      alt={content.title || 'Research funding request'}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <FeedItemBody 
                    content={content}
                    metrics={entry.metrics}
                    contributors={entry.contributors}
                    hideTypeLabel
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
