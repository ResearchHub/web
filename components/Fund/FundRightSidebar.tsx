'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { LeaderboardFunderSkeleton } from '@/components/Leaderboard/LeaderboardOverview';

const LeaderboardFunderOverview = dynamic(
  () =>
    import('@/components/Leaderboard/LeaderboardOverview').then(
      (mod) => mod.LeaderboardFunderOverview
    ),
  {
    ssr: false,
    loading: () => <LeaderboardFunderSkeleton />,
  }
);

const fundingSteps = [
  {
    title: 'Funder Posts Opportunity',
    description: 'Funders post opportunities with clear goals',
  },
  {
    title: 'Pitch Your Idea',
    description: 'Submit a proposal',
  },
  {
    title: 'Community Validates',
    description: 'Experts review and boost top proposals',
  },
  {
    title: 'Get Funded',
    description: 'Receive funds directly to your account',
    extra: { label: 'Fast funding', value: '~2 weeks avg' },
  },
];

export const FundRightSidebar = () => {
  return (
    <div className="space-y-3">
      {/* How Funding Works */}
      <div className="rounded-xl bg-gradient-to-b from-white to-gray-50/50 p-5 overflow-hidden">
        <div className="flex items-center gap-2 mb-5">
          <h3 className="font-semibold text-gray-900">How Funding Works</h3>
        </div>

        <div className="relative">
          {/* Connecting line - stops before last step */}
          <div className="absolute left-[13px] top-[14px] bottom-[42px] w-0.5 bg-blue-200" />

          <div className="space-y-4">
            {fundingSteps.map((step, index) => {
              return (
                <div key={index} className="relative flex gap-3 group">
                  {/* Step indicator */}
                  <div className="relative flex-shrink-0">
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center z-10 relative ring-2 ring-white shadow-sm group-hover:scale-110 transition-transform">
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-1">
                    <div className="text-sm font-semibold text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{step.description}</div>
                    {step.extra && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-gray-600">{step.extra.label}</span>
                        <span className="text-xs font-semibold text-emerald-600">
                          {step.extra.value}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Funders Leaderboard */}
      <div className="rounded-xl bg-white p-4">
        <LeaderboardFunderOverview />
      </div>

      {/* Resources */}
      <div className="rounded-xl bg-white p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Resources</h3>
        <div className="space-y-1">
          <a
            href="https://blog.researchhub.foundation/funding-for-researchers/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm text-gray-900">Funding Guidelines</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </a>
          <a
            href="https://drive.google.com/file/d/1wQVjVfy4x6VadIExEysx4VyLJN9dkD53/view"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm text-gray-900">Peer Review Process</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </a>
          <a
            href="https://researchhub.notion.site/ResearchHub-a2a87270f645483794c56ad12b4b7a0c?pvs=4"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm text-gray-900">FAQ</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </a>
          <a
            href="mailto:support@researchhub.com"
            className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm text-gray-900">Contact Support</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
