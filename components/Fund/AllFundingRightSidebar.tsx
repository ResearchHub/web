'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Zap, Send, Users, Trophy } from 'lucide-react';
import Icon from '@/components/ui/icons/Icon';

const fundingSteps = [
  {
    icon: Zap,
    title: 'Funder Posts RFP',
    description: 'Funders post opportunities with clear goals',
  },
  {
    icon: Send,
    title: 'Pitch Your Idea',
    description: 'Submit a proposal',
  },
  {
    icon: Users,
    title: 'Community Validates',
    description: 'Experts review and boost top proposals',
  },
  {
    icon: Trophy,
    title: 'Get Funded',
    description: 'Receive funds directly to your account',
  },
];

export const AllFundingRightSidebar = () => {
  return (
    <div className="space-y-6">
      {/* Funding Stats */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Funding Stats</h3>
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">$105K</div>
            <div className="text-sm text-gray-600 mt-1">Available in Funding</div>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">$12.4K</div>
            <div className="text-sm text-gray-600 mt-1">Funded this month</div>
          </div>
        </div>
      </div>

      {/* How Funding Works - Enhanced */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/50 p-5 overflow-hidden">
        <div className="flex items-center gap-2 mb-5">
          <h3 className="text-lg font-semibold text-gray-900">How It Works</h3>
        </div>

        <div className="relative">
          {/* Connecting line - stops before last step */}
          <div className="absolute left-[13px] top-[14px] bottom-[42px] w-0.5 bg-blue-200" />

          <div className="space-y-4">
            {fundingSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="relative flex gap-3 group">
                  {/* Step indicator */}
                  <div className="relative flex-shrink-0">
                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center z-10 relative ring-2 ring-white shadow-sm group-hover:scale-110 transition-transform">
                      <IconComponent className="w-3.5 h-3.5 text-blue-600" strokeWidth={2} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-1">
                    <div className="text-sm font-semibold text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{step.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Success indicator */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-700">Fast funding</span>
            </div>
            <span className="text-sm font-semibold text-emerald-600">~2 weeks avg</span>
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Resources</h3>
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
