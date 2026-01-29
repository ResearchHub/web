'use client';

import React from 'react';
import { BookCheck, Feather, ExternalLink } from 'lucide-react';
import { RightSidebarBanner } from '@/components/ui/RightSidebarBanner';

export const FundRightSidebar = () => {
  return (
    <div className="space-y-6">
      <RightSidebarBanner
        title="Get Funded."
        description="Share a research proposal and get crowdfunded by the community."
        bulletPoints={[
          'Early expert feedback',
          'Donors get tax deductions',
          'Fully discretionary funds',
        ]}
        buttonText="Request funding"
        buttonLink="/notebook?newFunding=true"
        iconName="fundYourRsc2"
        iconColor="#2563eb"
        iconSize={20}
        variant="blue"
      />

      {/* Resources */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Resources</h3>
        <div className="space-y-3">
          <a
            href="https://docs.researchhub.com/researchhub/product-features/fund/funding-recipients"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookCheck size={16} className="text-primary-600" />
              <span>How to Apply for Funding</span>
            </div>
            <div className="ml-4">
              <ExternalLink size={14} className="text-gray-400" />
            </div>
          </a>
          <a
            href="https://docs.researchhub.com/researchhub-foundation/programs-and-initiatives/peer-review-program/peer-review-program-guidelines"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Feather size={16} className="text-primary-600" />
              <span>Peer Review Guidelines</span>
            </div>
            <div className="ml-4">
              <ExternalLink size={14} className="text-gray-400" />
            </div>
          </a>
        </div>
      </div>

      <div>
        <h3 className="text-md font-semibold mb-4">How to Request Funding</h3>
        <ol className="list-none space-y-3 text-gray-600 mb-4 text-sm">
          <li className="flex">
            <span className="mr-3 font-medium">1.</span>
            <span>Create your research proposal</span>
          </li>
          <li className="flex">
            <span className="mr-3 font-medium">2.</span>
            <span>Include a clear budget</span>
          </li>
          <li className="flex">
            <span className="mr-3 font-medium">3.</span>
            <span>Add your university as the nonprofit recipient</span>
          </li>
          <li className="flex">
            <span className="mr-3 font-medium">4.</span>
            <span>Upload for crowdfunding or an RFP</span>
          </li>
          <li className="flex">
            <span className="mr-3 font-medium">5.</span>
            <span>Use peer review to improve your work</span>
          </li>
          <li className="flex">
            <span className="mr-3 font-medium">6.</span>
            <span>Receive funds to your institution</span>
          </li>
        </ol>
      </div>
    </div>
  );
};
