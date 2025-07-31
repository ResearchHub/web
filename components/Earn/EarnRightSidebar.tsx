'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  Award,
  BookOpen,
  MessageSquare,
  ExternalLink,
  Coins,
  HelpCircle,
  Route,
} from 'lucide-react';
import { CollapsibleItem, SimpleCollapsibleSection } from '@/components/ui/CollapsibleSection';
import { useRouter } from 'next/navigation';

export const EarnRightSidebar = () => {
  const router = useRouter();
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleCreateBounty = () => {
    router.push('/bounty/create');
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-100 p-6">
        <h3 className="text-lg font-semibold mb-4">Create a Bounty</h3>
        <p className="text-gray-600 mb-2">
          Experts can accelerate your research – use their help with:
        </p>

        <p className="text-gray-600 mb-4 italic font-medium">
          {' '}
          Statistical analysis, methods checks, peer reviews, and more
        </p>
        <Button className="w-full" onClick={handleCreateBounty}>
          Create Bounty
        </Button>
      </div>

      <div>
        <h3 className="text-md font-semibold mb-4">How bounties works</h3>
        <ol className="list-none space-y-3 text-gray-600 mb-4 text-sm">
          <li className="flex">
            <span className="mr-3 font-medium">1.</span>
            <span>Select a bounty that matches your expertise</span>
          </li>
          <li className="flex">
            <span className="mr-3 font-medium">2.</span>
            <span>Complete the required task (review or answer)</span>
          </li>
          <li className="flex">
            <span className="mr-3 font-medium">3.</span>
            <span>Receive RSC when your submission is awarded</span>
          </li>
        </ol>
      </div>

      <SimpleCollapsibleSection title="About ResearchCoin">
        <div className="text-gray-600 text-sm space-y-2">
          <CollapsibleItem
            title="What is ResearchCoin (RSC)?"
            icon={<Coins className="w-4 h-4" strokeWidth={2} />}
            isOpen={openSections.includes('what-is-rsc')}
            onToggle={() => toggleSection('what-is-rsc')}
          >
            ResearchCoin (RSC) is a digital currency that incentivizes good science by allowing
            users to create grants, reward quality contributions, and fund open science initiatives
            on ResearchHub.
          </CollapsibleItem>

          <CollapsibleItem
            title="Why RSC?"
            icon={<HelpCircle className="w-4 h-4" strokeWidth={2} />}
            isOpen={openSections.includes('why-rsc')}
            onToggle={() => toggleSection('why-rsc')}
          >
            RSC creates a transparent, merit-based ecosystem where researchers can be directly
            rewarded for their contributions to science. It helps bridge the gap between valuable
            research work and financial recognition.
          </CollapsibleItem>

          <CollapsibleItem
            title="Getting Started with RSC"
            icon={<Route className="w-4 h-4" strokeWidth={2} />}
            isOpen={openSections.includes('getting-started')}
            onToggle={() => toggleSection('getting-started')}
          >
            To begin with ResearchCoin:
            <ul className="mt-2 space-y-1.5">
              <li>1. Create a ResearchHub account</li>
              <li>2. Verify your academic credentials</li>
              <li>3. Start engaging with content through reviews and discussions</li>
              <li>4. Earn your first RSC through participation</li>
              <li>5. Explore rewards and funding opportunities</li>
            </ul>
          </CollapsibleItem>
        </div>
      </SimpleCollapsibleSection>
    </div>
  );
};
