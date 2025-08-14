'use client';

import React, { useState } from 'react';
import { CollapsibleItem, SimpleCollapsibleSection } from '@/components/ui/CollapsibleSection';
import {
  BookCheck,
  Lightbulb,
  Zap,
  Banknote,
  Target,
  Share2,
  Feather,
  ArrowUpRightSquare,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Icon } from '@/components/ui/icons/Icon';
import Link from 'next/link';
import { CTACard } from '@/components/ui/CTACard';

export const FundRightSidebar = () => {
  const [openSections, setOpenSections] = useState<string[]>(['why-fund']); // Default open section

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  return (
    <div className="space-y-6">
      <CTACard
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
            href="https://blog.researchhub.foundation/funding-for-researchers/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Feather size={16} className="text-primary-600" />
              <span>Applying for funding guidelines</span>
            </div>
            <div className="ml-4">
              <ExternalLink size={14} className="text-gray-400" />
            </div>
          </a>
        </div>
      </div>

      <SimpleCollapsibleSection title="How does it work?">
        <div className="pl-6">
          <CollapsibleItem
            title="1. Plan your experiment"
            isOpen={openSections.includes('preregister')}
            onToggle={() => toggleSection('preregister')}
          >
            Researchers plan their experiment in the open, providing all relevant methodological
            details and planned analyses openly before receiving funding.
          </CollapsibleItem>
          <CollapsibleItem
            title="2. Link a nonprofit (Recommended)"
            isOpen={openSections.includes('tax-deduct')}
            onToggle={() => toggleSection('tax-deduct')}
          >
            Researchers can coordinate with a qualifying nonprofit via the lab notebook to enable
            tax deductions for donors and improved processing of funds.
          </CollapsibleItem>
          <CollapsibleItem
            title="3. Receive expert review"
            isOpen={openSections.includes('peer-review')}
            onToggle={() => toggleSection('peer-review')}
          >
            Experts and the community review the proposal, providing feedback to improve rigor and
            reproducibility, offering insight into the work.
          </CollapsibleItem>
          <CollapsibleItem
            title="4. Receive crowdfunding"
            isOpen={openSections.includes('pledge')}
            onToggle={() => toggleSection('pledge')}
          >
            Users review the proposal and peer feedback, then contribute funds (any amount) directly
            to the projects they support via RSC or USD.
          </CollapsibleItem>
          <CollapsibleItem
            title="5. Funds are disbursed"
            isOpen={openSections.includes('disburse')}
            onToggle={() => toggleSection('disburse')}
          >
            Once fully raised,{' '}
            <Link
              href="https://endaoment.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              Endaoment
            </Link>{' '}
            provides nonprofit support, asset conversion, and sends contributions directly to the
            institution or researcher.
          </CollapsibleItem>
          <CollapsibleItem
            title="6. Funds arrive"
            isOpen={openSections.includes('unrestricted')}
            onToggle={() => toggleSection('unrestricted')}
          >
            Funds arrive in the researcher's discretionary spending account at their institution,
            free from traditional grant restrictions on usage.
          </CollapsibleItem>
        </div>
      </SimpleCollapsibleSection>
    </div>
  );
};
