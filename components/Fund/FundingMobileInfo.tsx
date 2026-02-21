'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Info, ChevronRight, Send, Star, Coins } from 'lucide-react';
import Icon from '@/components/ui/icons/Icon';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';

export const FundingMobileInfo = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {/* Horizontal scrolling CTA cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {/* Researcher CTA */}
        <Link
          href="/notebook?newFunding=true"
          className="flex-shrink-0 w-[280px] rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 p-4 text-white"
        >
          <h3 className="font-semibold mb-1">Are you a researcher?</h3>
          <p className="text-xs text-orange-100 mb-2">
            Apply for funding or submit your own proposal
          </p>
          <span className="text-sm font-medium">Get Started →</span>
        </Link>

        {/* Funder CTA */}
        <Link
          href="/notebook?newGrant=true"
          className="flex-shrink-0 w-[280px] rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-4 text-white"
        >
          <h3 className="font-semibold mb-1">Want to fund research?</h3>
          <p className="text-xs text-blue-100 mb-2">Back proposals or post an RFP</p>
          <span className="text-sm font-medium">Start Funding →</span>
        </Link>

        {/* Info card */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex-shrink-0 w-[120px] rounded-xl bg-gray-100 p-4 flex flex-col items-center justify-center gap-2 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <Info className="w-6 h-6" />
          <span className="text-sm font-medium">Learn More</span>
        </button>
      </div>

      {/* Bottom sheet with detailed info */}
      <SwipeableDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        height="85vh"
        header={<h2 className="text-lg font-semibold text-gray-900">About Funding</h2>}
      >
        <div className="space-y-6">
          {/* Funding Stats */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Funding Stats</h3>
            <div className="flex items-center justify-center gap-8 py-2">
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

          {/* How Funding Works - Timeline */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How Funding Works</h3>
            <div className="relative">
              {/* Step 1 */}
              <div className="flex gap-3 items-center pb-5">
                <div className="relative flex flex-col items-center">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center z-10">
                    <Icon name="fund" size={14} color="#2563eb" />
                  </div>
                  <div className="absolute top-8 w-px h-3 border-l-2 border-dashed border-gray-300" />
                </div>
                <span className="text-sm font-medium text-gray-700">Funder opens an RFP</span>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3 items-center pb-5">
                <div className="relative flex flex-col items-center">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center z-10">
                    <Send className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.5} />
                  </div>
                  <div className="absolute top-8 w-px h-3 border-l-2 border-dashed border-gray-300" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Researchers submit proposals
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3 items-center pb-5">
                <div className="relative flex flex-col items-center">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center z-10">
                    <Star className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.5} />
                  </div>
                  <div className="absolute top-8 w-px h-3 border-l-2 border-dashed border-gray-300" />
                </div>
                <span className="text-sm font-medium text-gray-700">Community peer review</span>
              </div>

              {/* Step 4 */}
              <div className="flex gap-3 items-center">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Coins className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium text-gray-700">Funds are distributed</span>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Resources</h3>
            <div className="space-y-1">
              <a
                href="https://blog.researchhub.foundation/funding-for-researchers/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-3 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm text-gray-900">Funding Guidelines</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href="https://drive.google.com/file/d/1wQVjVfy4x6VadIExEysx4VyLJN9dkD53/view"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-3 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm text-gray-900">Peer Review Process</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href="https://researchhub.notion.site/ResearchHub-a2a87270f645483794c56ad12b4b7a0c?pvs=4"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-3 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm text-gray-900">FAQ</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href="mailto:support@researchhub.com"
                className="flex items-center justify-between py-3 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm text-gray-900">Contact Support</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>
        </div>
      </SwipeableDrawer>
    </>
  );
};
