'use client';

import { useState } from 'react';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { Button } from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/BaseModal';
import { Search, FileText, Coins, ExternalLink, BookOpen } from 'lucide-react';

const steps = [
  {
    icon: Search,
    text: 'Select a peer-review bounty that matches your expertise',
  },
  {
    icon: FileText,
    text: 'Follow the requirements and submit a peer review',
  },
  {
    icon: Coins,
    text: 'Receive ResearchCoin when your submission is awarded',
  },
];

export function EarnHeroBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <HeroHeader
        title="Earn for Peer Reviews"
        subtitle={
          <p className="text-gray-500 text-base">Earn ResearchCoin for peer-reviewing papers.</p>
        }
        cta={
          <Button
            variant="outlined"
            size="lg"
            className="max-sm:!text-xs max-sm:!h-8 max-sm:!px-2"
            onClick={() => setIsModalOpen(true)}
          >
            Learn More
          </Button>
        }
      />

      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="About Peer Reviews"
        size="md"
      >
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">How it works</h3>
          <ol className="space-y-4">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-600 font-semibold text-xs">
                  {i + 1}
                </div>
                <div className="pt-0.5">
                  <p className="text-gray-800 text-sm leading-relaxed">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Resources</h3>
          <div className="space-y-3">
            <a
              href="https://docs.researchhub.com/researchhub-foundation/programs-and-initiatives/peer-review-program/peer-review-guidelines"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <BookOpen size={16} className="flex-shrink-0" />
                Peer Review Walkthrough
              </span>
              <ExternalLink size={14} className="flex-shrink-0 text-gray-400" />
            </a>
          </div>
        </div>
      </BaseModal>
    </>
  );
}
