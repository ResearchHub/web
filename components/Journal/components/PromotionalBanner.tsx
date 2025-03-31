'use client';

import { FC } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/icons/Icon';
import { Clock } from 'lucide-react';
import { AvatarStack } from '@/components/ui/AvatarStack';

export const PromotionalBanner: FC = () => {
  return (
    <div className="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg overflow-hidden border border-indigo-100 transform transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row items-center justify-between">
        {/* Visual element and title */}
        <div className="flex items-center gap-3 p-4 md:p-6 md:pl-8">
          <div className="bg-white p-2 rounded-full shadow-sm">
            <Icon name="rhJournal1" size={38} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-indigo-900">
              Accelerate Scientific Progress
            </h3>
            <p className="text-sm text-indigo-700">
              Join leading researchers publishing in ResearchHub Journal
            </p>
          </div>
        </div>

        {/* Benefits section - hide on mobile */}
        <div className="hidden md:flex justify-center p-6 space-x-12">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-full">
              <Clock className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-gray-800">Fast Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-full">
              <Icon name="rscGold" size={20} />
            </div>
            <span className="text-sm font-medium text-gray-800">Earn RSC</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-full">
              <Icon name="doi" size={20} />
            </div>
            <span className="text-sm font-medium text-gray-800">Get a DOI</span>
          </div>
        </div>

        {/* Contributors and CTA */}
        <div className="flex items-center gap-6 p-4 md:p-6 md:pr-8 bg-indigo-100/50">
          <div className="hidden sm:block">
            <p className="text-xs text-indigo-700 font-medium mb-1">Our contributors:</p>
            <AvatarStack
              items={[
                {
                  src: 'https://www.researchhub.com/static/editorial-board/MaulikDhandha.jpeg',
                  alt: 'Maulik Dhandha',
                  tooltip: 'Maulik Dhandha, Editor',
                },
                {
                  src: 'https://www.researchhub.com/static/editorial-board/EmilioMerheb.jpeg',
                  alt: 'Emilio Merheb',
                  tooltip: 'Emilio Merheb, Editor',
                },
                {
                  src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/05/07/blob_48esqmw',
                  alt: 'Journal Editor',
                  tooltip: 'Editorial Board Member',
                },
                {
                  src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/04/blob_pxj9rsH',
                  alt: 'Journal Editor',
                  tooltip: 'Editorial Board Member',
                },
                {
                  src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2023/06/25/blob',
                  alt: 'Journal Editor',
                  tooltip: 'Editorial Board Member',
                },
              ]}
              size="xs"
              maxItems={5}
              spacing={-8}
              showExtraCount={true}
              ringColorClass="ring-white"
            />
          </div>
          <Link href="/paper/create/pdf">
            <button className="flex items-center gap-1 px-5 py-2 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 transition-all">
              Submit Paper
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
