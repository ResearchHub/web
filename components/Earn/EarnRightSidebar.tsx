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
  Feather,
  Users,
  ArrowUpRightSquare,
  Check,
} from 'lucide-react';
import { CollapsibleItem, SimpleCollapsibleSection } from '@/components/ui/CollapsibleSection';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icons/Icon';

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
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
          <Icon name="earn1" size={20} color="#2563eb" />
          Create a Bounty
        </h3>
        <p className="text-gray-900 mb-2 text-sm">Incentivize experts to help with</p>

        <ul className="space-y-2 mb-4">
          <li className="flex items-center gap-2 text-sm text-gray-900">
            <Check className="w-4 h-4 flex-shrink-0 text-blue-500" strokeWidth={2.5} />
            <span>Peer reviews</span>
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-900">
            <Check className="w-4 h-4 flex-shrink-0 text-blue-500" strokeWidth={2.5} />
            <span>Statistical analysis</span>
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-900">
            <Check className="w-4 h-4 flex-shrink-0 text-blue-500" strokeWidth={2.5} />
            <span>Methods checks</span>
          </li>
        </ul>
        <Button className="w-full" onClick={handleCreateBounty}>
          Create Bounty
        </Button>
      </div>

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
            href="https://drive.google.com/file/d/1wQVjVfy4x6VadIExEysx4VyLJN9dkD53/view"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Feather size={16} className="text-primary-600" />
              <span>Peer Review Guidelines (Funding)</span>
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
