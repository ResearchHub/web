'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  MessageSquare,
  ExternalLink,
  Coins,
  HelpCircle,
  Route,
  Feather,
  Users,
  ArrowUpRightSquare,
} from 'lucide-react';
import { CollapsibleItem, SimpleCollapsibleSection } from '@/components/ui/CollapsibleSection';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icons/Icon';
import { CTACard } from '@/components/ui/CTACard';

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
      <CTACard
        title="Create a Bounty"
        description="Incentivize experts to help with your research needs."
        bulletPoints={['Peer reviews', 'Statistical analysis', 'Methods checks']}
        buttonText="Create Bounty"
        buttonLink="/bounty/create"
        iconName="earn1"
        iconColor="#2563eb"
        iconSize={20}
        variant="blue"
      />

      {/* Resources */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Resources</h3>
        <div className="space-y-3">
          <a
            href="https://blog.researchhub.foundation/peer-reviewing-on-researchhub/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users size={16} className="text-primary-600" />
              <span>Peer Review Walkthrough</span>
            </div>
            <div className="ml-4">
              <ExternalLink size={14} className="text-gray-400" />
            </div>
          </a>
          <a
            href="https://drive.google.com/file/d/1t7NpL39ghnBY9ImWjuunbc6gzmzrhqUt/view?ref=blog.researchhub.foundation"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Feather size={16} className="text-primary-600" />
              <span>Peer Review Guidelines (Preprint)</span>
            </div>
            <div className="ml-4">
              <ExternalLink size={14} className="text-gray-400" />
            </div>
          </a>
          <a
            href="https://airtable.com/apptLQP8XMy1kaiID/paguOk9TtZktFk5WQ/form"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Award size={16} className="text-primary-600" />
              <span>Request a Peer Review Bounty</span>
            </div>
            <div className="ml-4">
              <ExternalLink size={14} className="text-gray-400" />
            </div>
          </a>
        </div>
      </div>

      <div>
        <h3 className="text-md font-semibold mb-4">How Bounties Work</h3>
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
    </div>
  );
};
