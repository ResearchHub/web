'use client';

import React from 'react';
import { Icon } from '@/components/ui/icons/Icon';
import { RightSidebarBanner } from '@/components/ui/RightSidebarBanner';
import { ExternalLink } from 'lucide-react';

export const GrantRightSidebar = () => {
  return (
    <div className="space-y-6">
      <RightSidebarBanner
        title="Fund Smarter."
        description="Make every research dollar count with open access funding."
        bulletPoints={['Preregistered research', 'Open peer review', 'Regular progress updates']}
        buttonText="Open an RFP"
        buttonLink="/notebook?newGrant=true"
        iconName="fund2"
        iconColor="#2563eb"
        iconSize={20}
        variant="blue"
      />

      {/* Resources Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Resources</h3>
        <div className="space-y-3">
          <a
            href="https://docs.researchhub.com/researchhub/product-features/fund"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Icon name="fund" size={16} color="#2563eb" />
              <span className="whitespace-nowrap">Funding Guide</span>
            </div>
            <div className="ml-4">
              <ExternalLink size={14} className="text-gray-400" />
            </div>
          </a>
        </div>
      </div>

      <div>
        <h3 className="text-md font-semibold mb-4">How Funding Works</h3>
        <ol className="list-none space-y-3 text-gray-600 mb-4 text-sm">
          <li className="flex">
            <span className="mr-3 font-medium">1.</span>
            <span>Upload an RFP</span>
          </li>
          <li className="flex">
            <span className="mr-3 font-medium">2.</span>
            <span>ResearchHub recruits applicants</span>
          </li>
          <li className="flex">
            <span className="mr-3 font-medium">3.</span>
            <span>Peer review helps improve proposals</span>
          </li>
          <li className="flex">
            <span className="mr-3 font-medium">4.</span>
            <span>
              Distribute funds to proposals (Tax-deductible with 0–10% university overhead)
            </span>
          </li>
          <li className="flex">
            <span className="mr-3 font-medium">5.</span>
            <span>Researchers share progress updates</span>
          </li>
        </ol>
      </div>
    </div>
  );
};
